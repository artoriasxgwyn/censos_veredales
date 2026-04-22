import Resident from '../models/resident.model.js';
import User from '../models/user.model.js';

export const getResidents = async (req, res) => {
  try {
    // Presidente ve todos los residentes de su comunidad
    if (req.userRole === 'president') {
      const residents = await Resident.find({
        communityId: req.communityId,
        isActive: true
      })
        .populate('userId', 'fullName documentNumber email role')
        .populate('dwellingId', 'houseNomenclature arrivalInstructions');
      return res.json({ success: true, data: residents });
    }

    // Otros roles solo ven sus propios registros de residente
    const residents = await Resident.find({
      userId: req.userId,
      isActive: true
    })
      .populate('userId', 'fullName documentNumber email role')
      .populate('dwellingId', 'houseNomenclature arrivalInstructions');

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
      .populate('dwellingId', 'houseNomenclature arrivalInstructions');

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

    const resident = await Resident.create({
      ...req.validatedBody,
      communityId: req.communityId
    });
    res.status(201).json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateResident = async (req, res) => {
  try {
    const resident = await Resident.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      req.validatedBody,
      { new: true, runValidators: true }
    );
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Residente no encontrado en tu comunidad' });
    }
    res.json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResident = async (req, res) => {
  try {
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
    const resident = await Resident.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      { approvedByPresident: status },
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
    const resident = await Resident.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      { approvedByTreasurer: status },
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
    const resident = await Resident.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      { approvedBySecretary: status },
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
