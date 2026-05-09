import Dwelling from '../models/dwelling.model.js';
import User from '../models/user.model.js';
import { notifyAllAdmins } from './notification.controller.js';

export const getDwellings = async (req, res) => {
  try {
    // Obtener documento del usuario para obtener su cédula
    const currentUser = await User.findById(req.userId).select('documentNumber communityId');

    // Presidente, Secretario y Tesorero ven todas las viviendas de su comunidad
    if (req.userRole === 'president' || req.userRole === 'secretario' || req.userRole === 'tesorero') {
      const dwellings = await Dwelling.find({
        communityId: req.communityId,
        isActive: true
      })
        .populate('ownerUserId', 'fullName email')
        .populate('communityId', 'neighborhood city code');
      return res.json({ success: true, data: dwellings });
    }

    // Residente solo ve sus propias viviendas (por userId o por cédula)
    const dwellings = await Dwelling.find({
      communityId: req.communityId,
      isActive: true,
      $or: [
        { ownerUserId: req.userId },
        { cedulaPropietario: currentUser.documentNumber }
      ]
    })
      .populate('ownerUserId', 'fullName email')
      .populate('communityId', 'neighborhood city code');

    res.json({ success: true, data: dwellings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDwellingById = async (req, res) => {
  try {
    // Presidente, Secretario y Tesorero pueden ver cualquier vivienda de su comunidad
    if (req.userRole === 'president' || req.userRole === 'secretario' || req.userRole === 'tesorero') {
      const dwelling = await Dwelling.findOne({
        _id: req.params.id,
        communityId: req.communityId,
        isActive: true
      })
        .populate('ownerUserId', 'fullName email')
        .populate('communityId', 'neighborhood city code');

      if (!dwelling) {
        return res.status(404).json({ success: false, message: 'Vivienda no encontrada' });
      }
      return res.json({ success: true, data: dwelling });
    }

    // Otros roles solo pueden ver sus propias viviendas (por userId o por cédula)
    const currentUser = await User.findById(req.userId).select('documentNumber');
    const dwelling = await Dwelling.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true,
      $or: [
        { ownerUserId: req.userId },
        { cedulaPropietario: currentUser.documentNumber }
      ]
    })
      .populate('ownerUserId', 'fullName email')
      .populate('communityId', 'neighborhood city code');

    if (!dwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada' });
    }
    res.json({ success: true, data: dwelling });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDwelling = async (req, res) => {
  try {
    // Validar que el usuario tenga comunidad asignada
    if (!req.communityId) {
      return res.status(400).json({
        success: false,
        message: 'Usuario sin comunidad asignada. Contacta al administrador.'
      });
    }

    const { cedulaPropietario } = req.validatedBody;

    // Buscar usuario por cédula en la comunidad del usuario que crea la vivienda
    let ownerUserId = null;

    if (cedulaPropietario) {
      const propietario = await User.findOne({
        documentNumber: cedulaPropietario,
        communityId: req.communityId,
        isActive: true
      });

      // Si encuentra el usuario, usar su ID, si no, dejar null
      ownerUserId = propietario?._id || null;
    }

    // Presidente crea viviendas activas inmediatamente (las 3 aprobaciones se marcan solas)
    // Secretario/Tesorero crean viviendas pendientes (su voto ya está aprobado, faltan 2)
    // Censista crea viviendas pendientes (ningún voto automático, faltan los 3 admins)
    const initialApprovals = req.userRole === 'president'
      ? { approvedByPresident: 'approved', approvedByTreasurer: 'approved', approvedBySecretary: 'approved' }
      : req.userRole === 'tesorero'
        ? { approvedByPresident: 'pending', approvedByTreasurer: 'approved', approvedBySecretary: 'pending' }
        : req.userRole === 'secretario'
          ? { approvedByPresident: 'pending', approvedByTreasurer: 'pending', approvedBySecretary: 'approved' }
          : { approvedByPresident: 'pending', approvedByTreasurer: 'pending', approvedBySecretary: 'pending' };

    const status = req.userRole === 'president' ? 'approved' : 'pending';

    // Crear vivienda con ownerUserId (puede ser null si no encontró la cédula)
    const dwellingData = {
      ...req.validatedBody,
      communityId: req.communityId,
      ownerUserId,
      cedulaPropietario,
      createdBy: req.userId,
      ...initialApprovals,
      status
    };

    const dwelling = await Dwelling.create(dwellingData);

    // Notificar a los admins si requiere aprobación (no fue creado por presidente)
    if (req.userRole !== 'president') {
      await notifyAllAdmins({
        communityId: req.communityId,
        type: 'dwelling_approval',
        title: 'Nueva vivienda pendiente de aprobación',
        message: `Se ha registrado una nueva vivienda. Requiere tu aprobación.`,
        entity: 'dwelling',
        entityId: dwelling._id,
        actionUrl: `/dwellings/${dwelling._id}`
      });
    }

    res.status(201).json({ success: true, data: dwelling });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDwelling = async (req, res) => {
  try {
    // Obtener documento del usuario para obtener su cédula
    const currentUser = await User.findById(req.userId).select('documentNumber');

    // Presidente puede actualizar cualquier vivienda de su comunidad
    if (req.userRole === 'president') {
      const dwelling = await Dwelling.findOneAndUpdate(
        { _id: req.params.id, communityId: req.communityId },
        req.validatedBody,
        { new: true, runValidators: true }
      );

      if (!dwelling) {
        return res.status(404).json({ success: false, message: 'Vivienda no encontrada en tu comunidad' });
      }
      return res.json({ success: true, data: dwelling });
    }

    // Secretario/Tesorero pueden actualizar cualquier vivienda de su comunidad
    if (req.userRole === 'secretario' || req.userRole === 'tesorero') {
      const dwelling = await Dwelling.findOne({
        _id: req.params.id,
        communityId: req.communityId,
        isActive: true
      });

      if (!dwelling) {
        return res.status(404).json({
          success: false,
          message: 'Vivienda no encontrada en tu comunidad'
        });
      }

      // Los cambios quedan pendientes de aprobación de los otros 2 admins
      const updateData = {
        ...req.validatedBody,
        approvedByPresident: 'pending',
        approvedByTreasurer: req.userRole === 'tesorero' ? 'approved' : 'pending',
        approvedBySecretary: req.userRole === 'secretario' ? 'approved' : 'pending',
        status: 'pending'
      };

      const updatedDwelling = await Dwelling.findOneAndUpdate(
        { _id: req.params.id, communityId: req.communityId },
        updateData,
        { new: true, runValidators: true }
      );

      return res.json({ success: true, data: updatedDwelling });
    }

    // Residente no puede actualizar directamente, debe solicitar modificación con triple aprobación
    if (req.userRole === 'residente') {
      return res.status(403).json({
        success: false,
        message: 'Los residentes deben solicitar la modificación de su vivienda a través del endpoint /api/dwelling-changes/:id/request. Los cambios requieren aprobación de los 3 administradores.'
      });
    }

    // Por defecto, otros roles no pueden actualizar
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para actualizar esta vivienda'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDwelling = async (req, res) => {
  try {
    // Solo presidente puede eliminar viviendas
    if (req.userRole !== 'president') {
      return res.status(403).json({
        success: false,
        message: 'Solo el presidente puede eliminar viviendas'
      });
    }

    const dwelling = await Dwelling.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      { isActive: false },
      { new: true }
    );

    if (!dwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada en tu comunidad' });
    }
    res.json({ success: true, message: 'Vivienda eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Endpoint para aprobación por presidente
export const approveByPresident = async (req, res) => {
  try {

    const { status } = req.validatedBody;

    // Calcular nuevo status basado en las aprobaciones
    const updateData = { approvedByPresident: status };

    // Buscar vivienda actual para calcular el status final
    const currentDwelling = await Dwelling.findOne({ _id: req.params.id, communityId: req.communityId });
    if (!currentDwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada en tu comunidad' });
    }

    // Calcular status después de actualizar
    const newApprovals = [
      status,
      currentDwelling.approvedByTreasurer || 'pending',
      currentDwelling.approvedBySecretary || 'pending'
    ];

    if (newApprovals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (newApprovals.every(a => a === 'approved')) {
      updateData.status = 'approved';
    }

    const dwelling = await Dwelling.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      updateData,
      { new: true }
    );

    if (!dwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada en tu comunidad' });
    }

    const messages = {
      approved: 'Presidente aprobó la vivienda',
      rejected: 'Presidente rechazó la vivienda',
      pending: 'Aprobación del presidente pendiente'
    };
    res.json({
      success: true,
      data: {
        dwelling,
        message: messages[status] || 'Estado actualizado'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Endpoint para aprobación por tesorero
export const approveByTreasurer = async (req, res) => {
  try {

    const { status } = req.validatedBody;

    const currentDwelling = await Dwelling.findOne({ _id: req.params.id, communityId: req.communityId });
    if (!currentDwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada en tu comunidad' });
    }

    const updateData = { approvedByTreasurer: status };
    const newApprovals = [
      currentDwelling.approvedByPresident || 'pending',
      status,
      currentDwelling.approvedBySecretary || 'pending'
    ];

    if (newApprovals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (newApprovals.every(a => a === 'approved')) {
      updateData.status = 'approved';
    }

    const dwelling = await Dwelling.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      updateData,
      { new: true }
    );

    if (!dwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada en tu comunidad' });
    }

    const messages = {
      approved: 'Tesorero aprobó la vivienda',
      rejected: 'Tesorero rechazó la vivienda',
      pending: 'Aprobación del tesorero pendiente'
    };
    res.json({
      success: true,
      data: {
        dwelling,
        message: messages[status] || 'Estado actualizado'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Endpoint para aprobación por secretario
export const approveBySecretary = async (req, res) => {
  try {
    const { status } = req.validatedBody;

    const currentDwelling = await Dwelling.findOne({ _id: req.params.id, communityId: req.communityId });
    if (!currentDwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada en tu comunidad' });
    }

    const updateData = { approvedBySecretary: status };
    const newApprovals = [
      currentDwelling.approvedByPresident || 'pending',
      currentDwelling.approvedByTreasurer || 'pending',
      status
    ];

    if (newApprovals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (newApprovals.every(a => a === 'approved')) {
      updateData.status = 'approved';
    }

    const dwelling = await Dwelling.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      updateData,
      { new: true }
    );

    if (!dwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada en tu comunidad' });
    }

    const messages = {
      approved: 'Secretario aprobó la vivienda',
      rejected: 'Secretario rechazó la vivienda',
      pending: 'Aprobación del secretario pendiente'
    };
    res.json({
      success: true,
      data: {
        dwelling,
        message: messages[status] || 'Estado actualizado'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Endpoint para obtener estado de aprobación de una vivienda
export const getApprovalStatus = async (req, res) => {
  try {
    const dwelling = await Dwelling.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!dwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada en tu comunidad' });
    }

    const approvals = [
      dwelling.approvedByPresident,
      dwelling.approvedByTreasurer,
      dwelling.approvedBySecretary
    ];
    const approvedCount = approvals.filter(a => a === 'approved').length;
    const rejectedCount = approvals.filter(a => a === 'rejected').length;
    const pendingCount = approvals.filter(a => a === 'pending').length;
    const hasRejection = rejectedCount > 0;

    res.json({
      success: true,
      data: {
        dwelling: {
          _id: dwelling._id,
          status: dwelling.status
        },
        approvals: {
          president: dwelling.approvedByPresident,
          treasurer: dwelling.approvedByTreasurer,
          secretary: dwelling.approvedBySecretary,
          counts: {
            approved: approvedCount,
            rejected: rejectedCount,
            pending: pendingCount
          },
          isFullyApproved: approvedCount === 3,
          isRejected: hasRejection
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
