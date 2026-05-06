import Resident from '../models/resident.model.js';
import User from '../models/user.model.js';
import { notifyAllAdmins } from './notification.controller.js';

export const getResidents = async (req, res) => {
  try {
    // Presidente, Secretario y Tesorero ven todos los residentes de su comunidad
    if (req.userRole === 'president' || req.userRole === 'secretario' || req.userRole === 'tesorero') {
      const residents = await Resident.find({
        communityId: req.communityId,
        isActive: true
      })
        .populate('userId', 'fullName documentNumber email role')
        .populate('dwellingId', 'houseNomenclature arrivalInstructions')
        .populate('communityId', 'neighborhood city code');
      return res.json({ success: true, data: residents });
    }

    // Residente solo ve sus propios registros de residente
    const residents = await Resident.find({
      userId: req.userId,
      isActive: true
    })
      .populate('userId', 'fullName documentNumber email role')
      .populate('dwellingId', 'houseNomenclature arrivalInstructions')
      .populate('communityId', 'neighborhood city code');

    res.json({ success: true, data: residents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getResidentById = async (req, res) => {
  try {
    const resident = await Resident.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    })
      .populate('userId', 'fullName documentNumber email role')
      .populate('dwellingId', 'houseNomenclature arrivalInstructions')
      .populate('communityId', 'neighborhood city code');

    if (!resident) {
      return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
    }
    res.json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createResident = async (req, res) => {
  try {
    // Verificar si ya existe el residente en esta comunidad
    const existing = await Resident.findOne({
      userId: req.validatedBody.userId,
      communityId: req.communityId,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya está registrado como residente en esta comunidad'
      });
    }

    // Presidente crea residentes activos inmediatamente (las 3 aprobaciones se marcan solas)
    // Secretario/Tesorero crean residentes pendientes (su voto ya está aprobado, faltan 2)
    // Censista crea residentes pendientes (ningún voto automático, faltan los 3 admins)
    const initialApprovals = req.userRole === 'president'
      ? { approvedByPresident: 'approved', approvedByTreasurer: 'approved', approvedBySecretary: 'approved' }
      : req.userRole === 'tesorero'
        ? { approvedByPresident: 'pending', approvedByTreasurer: 'approved', approvedBySecretary: 'pending' }
        : req.userRole === 'secretario'
          ? { approvedByPresident: 'pending', approvedByTreasurer: 'pending', approvedBySecretary: 'approved' }
          : { approvedByPresident: 'pending', approvedByTreasurer: 'pending', approvedBySecretary: 'pending' };

    const status = req.userRole === 'president' ? 'approved' : 'pending';

    const resident = await Resident.create({
      ...req.validatedBody,
      communityId: req.communityId,
      createdBy: req.userId,
      ...initialApprovals,
      status
    });

    // Notificar a los admins si requiere aprobación (no fue creado por presidente)
    if (req.userRole !== 'president') {
      await notifyAllAdmins({
        communityId: req.communityId,
        type: 'resident_approval',
        title: 'Nuevo residente pendiente de aprobación',
        message: `Se ha registrado un nuevo residente. Requiere tu aprobación.`,
        entity: 'resident',
        entityId: resident._id,
        actionUrl: `/residents/${resident._id}`
      });
    }

    res.status(201).json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateResident = async (req, res) => {
  try {
    // Presidente puede actualizar cualquier residente
    if (req.userRole === 'president') {
      const resident = await Resident.findOneAndUpdate(
        { _id: req.params.id, communityId: req.communityId },
        req.validatedBody,
        { new: true, runValidators: true }
      );
      if (!resident) {
        return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
      }
      return res.json({ success: true, data: resident });
    }

    // Residente solo puede actualizar su propio registro de residente
    if (req.userRole === 'residente') {
      const resident = await Resident.findOne({
        _id: req.params.id,
        communityId: req.communityId,
        userId: req.userId,
        isActive: true
      });

      if (!resident) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes actualizar tu propio registro de residente'
        });
      }

      // Los cambios quedan pendientes de aprobación triple
      const updateData = {
        ...req.validatedBody,
        approvedByPresident: 'pending',
        approvedByTreasurer: 'pending',
        approvedBySecretary: 'pending',
        status: 'pending'
      };

      const updatedResident = await Resident.findOneAndUpdate(
        { _id: req.params.id, communityId: req.communityId },
        updateData,
        { new: true, runValidators: true }
      );

      return res.json({ success: true, data: updatedResident });
    }

    // Secretario/Tesorero pueden actualizar cualquier residente de su comunidad
    if (req.userRole === 'secretario' || req.userRole === 'tesorero') {
      const resident = await Resident.findOne({
        _id: req.params.id,
        communityId: req.communityId,
        isActive: true
      });

      if (!resident) {
        return res.status(404).json({
          success: false,
          message: 'Residente no encontrado en tu comunidad'
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

      const updatedResident = await Resident.findOneAndUpdate(
        { _id: req.params.id, communityId: req.communityId },
        updateData,
        { new: true, runValidators: true }
      );

      return res.json({ success: true, data: updatedResident });
    }

    // Otros roles (censista, etc.) no pueden actualizar residentes
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para actualizar este residente'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResident = async (req, res) => {
  try {
    // Solo presidente puede eliminar residentes
    if (req.userRole !== 'president') {
      return res.status(403).json({
        success: false,
        message: 'Solo el presidente puede eliminar residentes'
      });
    }

    const resident = await Resident.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      { isActive: false },
      { new: true }
    );
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
    }
    res.json({ success: true, message: 'Residente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Endpoint para aprobación por presidente
export const approveByPresident = async (req, res) => {
  try {
    const { status } = req.validatedBody;

    const currentResident = await Resident.findOne({ _id: req.params.id, communityId: req.communityId });
    if (!currentResident) {
      return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
    }

    const updateData = { approvedByPresident: status };
    const newApprovals = [
      status,
      currentResident.approvedByTreasurer || 'pending',
      currentResident.approvedBySecretary || 'pending'
    ];

    if (newApprovals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (newApprovals.every(a => a === 'approved')) {
      updateData.status = 'approved';
    }

    const resident = await Resident.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      updateData,
      { new: true }
    );
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
    }
    const messages = {
      approved: 'Presidente aprobó al residente',
      rejected: 'Presidente rechazó al residente',
      pending: 'Aprobación del presidente pendiente'
    };
    res.json({
      success: true,
      data: {
        resident,
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

    const currentResident = await Resident.findOne({ _id: req.params.id, communityId: req.communityId });
    if (!currentResident) {
      return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
    }

    const updateData = { approvedByTreasurer: status };
    const newApprovals = [
      currentResident.approvedByPresident || 'pending',
      status,
      currentResident.approvedBySecretary || 'pending'
    ];

    if (newApprovals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (newApprovals.every(a => a === 'approved')) {
      updateData.status = 'approved';
    }

    const resident = await Resident.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      updateData,
      { new: true }
    );
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
    }
    const messages = {
      approved: 'Tesorero aprobó al residente',
      rejected: 'Tesorero rechazó al residente',
      pending: 'Aprobación del tesorero pendiente'
    };
    res.json({
      success: true,
      data: {
        resident,
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

    const currentResident = await Resident.findOne({ _id: req.params.id, communityId: req.communityId });
    if (!currentResident) {
      return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
    }

    const updateData = { approvedBySecretary: status };
    const newApprovals = [
      currentResident.approvedByPresident || 'pending',
      currentResident.approvedByTreasurer || 'pending',
      status
    ];

    if (newApprovals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (newApprovals.every(a => a === 'approved')) {
      updateData.status = 'approved';
    }

    const resident = await Resident.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      updateData,
      { new: true }
    );
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
    }
    const messages = {
      approved: 'Secretario aprobó al residente',
      rejected: 'Secretario rechazó al residente',
      pending: 'Aprobación del secretario pendiente'
    };
    res.json({
      success: true,
      data: {
        resident,
        message: messages[status] || 'Estado actualizado'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Endpoint para obtener estado de aprobación de un residente
export const getApprovalStatus = async (req, res) => {
  try {
    const resident = await Resident.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!resident) {
      return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
    }

    const approvals = [
      resident.approvedByPresident,
      resident.approvedByTreasurer,
      resident.approvedBySecretary
    ];
    const approvedCount = approvals.filter(a => a === 'approved').length;
    const rejectedCount = approvals.filter(a => a === 'rejected').length;
    const pendingCount = approvals.filter(a => a === 'pending').length;
    const hasRejection = rejectedCount > 0;

    res.json({
      success: true,
      data: {
        resident: {
          _id: resident._id,
          userId: resident.userId,
          status: resident.status
        },
        approvals: {
          president: resident.approvedByPresident,
          treasurer: resident.approvedByTreasurer,
          secretary: resident.approvedBySecretary,
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
