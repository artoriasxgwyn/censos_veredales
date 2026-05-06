import PendingProfileChange from '../models/pendingProfileChange.model.js';
import User from '../models/user.model.js';
import { createNotification } from '../controllers/notification.controller.js';

/**
 * Solicitar cambio de perfil (todos excepto presidente)
 */
export const requestProfileChange = async (req, res) => {
  try {
    const { fullName, documentNumber, birthDate, phone, email } = req.body;

    // Verificar que no haya otra solicitud pendiente
    const existingPending = await PendingProfileChange.findOne({
      userId: req.userId,
      status: 'pending'
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes una solicitud de cambio de perfil pendiente'
      });
    }

    // Crear solicitud pendiente con triple aprobación
    const pendingChange = await PendingProfileChange.create({
      userId: req.userId,
      communityId: req.communityId,
      requestedChanges: { fullName, documentNumber, birthDate, phone, email },
      status: 'pending',
      approvedByPresident: 'pending',
      approvedByTreasurer: 'pending',
      approvedBySecretary: 'pending'
    });

    // Obtener nombre del solicitante
    const requestingUser = await User.findById(req.userId).select('fullName');
    const requesterName = requestingUser?.fullName || 'Un usuario';

    // Notificar a todos los admins
    const admins = await User.find({
      communityId: req.communityId,
      role: { $in: ['president', 'tesorero', 'secretario'] },
      isActive: true
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        communityId: req.communityId,
        type: 'profile_change',
        title: 'Solicitud de cambio de perfil',
        message: `${requesterName} ha solicitado un cambio de perfil`,
        entity: 'profile',
        entityId: pendingChange._id,
        actionUrl: `/profile-changes/${pendingChange._id}`
      });
    }

    res.status(201).json({
      success: true,
      data: pendingChange,
      message: 'Solicitud enviada. La junta directiva debe aprobar el cambio.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtener solicitudes pendientes del usuario actual
 */
export const getMyPendingChanges = async (req, res) => {
  try {
    const changes = await PendingProfileChange.find({
      userId: req.userId
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: changes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtener todas las solicitudes pendientes de la comunidad (cualquier admin)
 */
export const getCommunityPendingChanges = async (req, res) => {
  try {
    // Solo admins pueden ver las solicitudes pendientes
    const adminRoles = ['president', 'tesorero', 'secretario'];
    if (!adminRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden ver las solicitudes pendientes'
      });
    }

    const changes = await PendingProfileChange.find({
      communityId: req.communityId,
      status: 'pending'
    })
      .populate('userId', 'fullName documentNumber email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: changes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Aprobar/rechazar cambio de perfil (cualquier admin de la junta)
 */
export const approveProfileChange = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    // Verificar que el usuario sea un admin
    const adminRoles = ['president', 'tesorero', 'secretario'];
    if (!adminRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden aprobar cambios de perfil'
      });
    }

    const pendingChange = await PendingProfileChange.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      status: 'pending'
    });

    if (!pendingChange) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o ya fue procesada'
      });
    }

    // Asignar aprobación según el rol del usuario
    const updateData = {};
    if (req.userRole === 'president') {
      updateData.approvedByPresident = status;
    } else if (req.userRole === 'tesorero') {
      updateData.approvedByTreasurer = status;
    } else if (req.userRole === 'secretario') {
      updateData.approvedBySecretary = status;
    }

    // Calcular nuevo status basado en todas las aprobaciones
    const newApprovals = [
      updateData.approvedByPresident || pendingChange.approvedByPresident,
      updateData.approvedByTreasurer || pendingChange.approvedByTreasurer,
      updateData.approvedBySecretary || pendingChange.approvedBySecretary
    ];

    if (newApprovals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
      updateData.rejectionReason = rejectionReason || null;
    } else if (newApprovals.every(a => a === 'approved')) {
      updateData.status = 'approved';
    }

    const updated = await PendingProfileChange.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Si fue aprobada por todos, aplicar cambios al usuario
    if (updated.status === 'approved') {
      const updateUserData = {};
      const { requestedChanges } = pendingChange;

      if (requestedChanges.fullName) updateUserData.fullName = requestedChanges.fullName;
      if (requestedChanges.documentNumber) updateUserData.documentNumber = requestedChanges.documentNumber;
      if (requestedChanges.birthDate) updateUserData.birthDate = requestedChanges.birthDate;
      if (requestedChanges.phone) updateUserData.phone = requestedChanges.phone;
      if (requestedChanges.email) updateUserData.email = requestedChanges.email;

      await User.findByIdAndUpdate(pendingChange.userId, updateUserData);
    }

    // Notificar al residente sobre la decisión
    const isFinal = updated.status !== 'pending';
    await createNotification({
      userId: pendingChange.userId,
      communityId: req.communityId,
      type: 'profile_change',
      title: isFinal
        ? (updated.status === 'approved' ? 'Cambio de perfil aprobado' : 'Cambio de perfil rechazado')
        : 'Voto registrado en cambio de perfil',
      message: isFinal
        ? (updated.status === 'approved'
          ? 'Tu solicitud de cambio de perfil ha sido aprobada por la junta directiva y aplicada'
          : `Tu solicitud de cambio de perfil ha sido rechazada${updated.rejectionReason ? ': ' + updated.rejectionReason : ''}`)
        : `Un administrador ha votado en tu solicitud de cambio de perfil`,
      entity: 'profile',
      entityId: pendingChange._id,
      actionUrl: `/profile-changes/${pendingChange._id}`
    });

    res.json({
      success: true,
      message: isFinal
        ? (updated.status === 'approved' ? 'Cambio de perfil aprobado y aplicado' : 'Solicitud rechazada')
        : 'Voto registrado exitosamente',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
