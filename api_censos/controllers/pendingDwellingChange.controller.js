import PendingDwellingChange from '../models/pendingDwellingChange.model.js';
import Dwelling from '../models/dwelling.model.js';
import { notifyAllAdmins, createNotification } from '../controllers/notification.controller.js';

/**
 * Solicitar modificación de vivienda (residente propietario)
 */
export const requestDwellingChange = async (req, res) => {
  try {
    const { houseNomenclature, arrivalInstructions, mapLocation, constructionDate, homePhoto, cedulaPropietario } = req.body;

    // Verificar que no haya otra solicitud pendiente para esta vivienda
    const existingPending = await PendingDwellingChange.findOne({
      dwellingId: req.params.id,
      status: 'pending'
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'Ya hay una solicitud de modificación pendiente para esta vivienda'
      });
    }

    // Verificar que el usuario es propietario de la vivienda
    const dwelling = await Dwelling.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true,
      $or: [
        { ownerUserId: req.userId },
        { cedulaPropietario: req.userDocumentNumber }
      ]
    });

    if (!dwelling) {
      return res.status(404).json({
        success: false,
        message: 'Vivienda no encontrada o no eres propietario de ella'
      });
    }

    // Crear solicitud pendiente con triple aprobación
    const pendingChange = await PendingDwellingChange.create({
      dwellingId: dwelling._id,
      requestedBy: req.userId,
      communityId: req.communityId,
      requestedChanges: {
        houseNomenclature,
        arrivalInstructions,
        mapLocation,
        constructionDate,
        homePhoto,
        cedulaPropietario
      },
      status: 'pending',
      approvedByPresident: 'pending',
      approvedBySecretary: 'pending',
      approvedByTreasurer: 'pending'
    });

    // Notificar a todos los admins
    await notifyAllAdmins({
      communityId: req.communityId,
      type: 'dwelling_change',
      title: 'Solicitud de modificación de vivienda',
      message: `Se ha solicitado una modificación para la vivienda ${dwelling.houseNomenclature || ''}`,
      entity: 'dwelling',
      entityId: pendingChange._id,
      actionUrl: `/dwelling-changes/${pendingChange._id}`
    });

    res.status(201).json({
      success: true,
      data: pendingChange,
      message: 'Solicitud enviada. Requiere aprobación de los 3 administradores.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtener solicitudes pendientes del usuario actual
 */
export const getMyPendingDwellingChanges = async (req, res) => {
  try {
    const changes = await PendingDwellingChange.find({
      requestedBy: req.userId
    })
      .populate('dwellingId', 'houseNomenclature')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: changes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtener todas las solicitudes pendientes de la comunidad (admin)
 */
export const getCommunityPendingDwellingChanges = async (req, res) => {
  try {
    // Solo admins pueden ver todas las solicitudes
    if (!['president', 'secretario', 'tesorero'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden ver las solicitudes pendientes'
      });
    }

    const changes = await PendingDwellingChange.find({
      communityId: req.communityId,
      status: 'pending'
    })
      .populate('dwellingId', 'houseNomenclature')
      .populate('requestedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: changes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Aprobar/rechazar modificación de vivienda (admin)
 */
export const approveDwellingChange = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const pendingChange = await PendingDwellingChange.findOne({
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

    // Actualizar aprobación según el rol del usuario
    if (req.userRole === 'president') {
      pendingChange.approvedByPresident = status;
    } else if (req.userRole === 'secretario') {
      pendingChange.approvedBySecretary = status;
    } else if (req.userRole === 'tesorero') {
      pendingChange.approvedByTreasurer = status;
    } else {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para aprobar esta solicitud'
      });
    }

    pendingChange.rejectionReason = status === 'rejected' ? rejectionReason : null;
    await pendingChange.save();

    // Si fue aprobado (los 3 admins), aplicar cambios a la vivienda
    if (pendingChange.status === 'approved') {
      const updateData = {};
      const { requestedChanges } = pendingChange;

      if (requestedChanges.houseNomenclature) updateData.houseNomenclature = requestedChanges.houseNomenclature;
      if (requestedChanges.arrivalInstructions) updateData.arrivalInstructions = requestedChanges.arrivalInstructions;
      if (requestedChanges.mapLocation) updateData.mapLocation = requestedChanges.mapLocation;
      if (requestedChanges.constructionDate) updateData.constructionDate = requestedChanges.constructionDate;
      if (requestedChanges.homePhoto) updateData.homePhoto = requestedChanges.homePhoto;
      if (requestedChanges.cedulaPropietario) updateData.cedulaPropietario = requestedChanges.cedulaPropietario;

      await Dwelling.findByIdAndUpdate(pendingChange.dwellingId, updateData);
    }

    // Notificar al residente propietario sobre la decisión
    const dwelling = await Dwelling.findById(pendingChange.dwellingId);
    const ownerUserId = dwelling.ownerUserId;

    if (ownerUserId) {
      await createNotification({
        userId: ownerUserId,
        communityId: req.communityId,
        type: 'dwelling_change',
        title: pendingChange.status === 'approved'
          ? 'Modificación de vivienda aprobada'
          : 'Modificación de vivienda rechazada',
        message: pendingChange.status === 'approved'
          ? `La modificación de tu vivienda ha sido aprobada y aplicada por ${req.userRole}`
          : `La modificación de tu vivienda ha sido rechazada por ${req.userRole}${pendingChange.rejectionReason ? ': ' + pendingChange.rejectionReason : ''}`,
        entity: 'dwelling',
        entityId: pendingChange._id,
        actionUrl: `/dwelling-changes/${pendingChange._id}`
      });
    }

    res.json({
      success: true,
      message: pendingChange.status === 'approved'
        ? 'Modificación aprobada y aplicada'
        : 'Solicitud rechazada',
      data: pendingChange
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
