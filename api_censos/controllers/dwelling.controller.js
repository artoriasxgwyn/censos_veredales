import Dwelling from '../models/dwelling.model.js';
import User from '../models/user.model.js';

export const getDwellings = async (req, res) => {
  try {
    // Presidente ve todas las viviendas de su comunidad, otros roles solo las suyas
    if (req.userRole === 'president') {
      const dwellings = await Dwelling.find({
        communityId: req.communityId,
        isActive: true
      }).populate('ownerUserId', 'fullName email');
      return res.json({ success: true, data: dwellings });
    }

    // Otros roles solo ven sus propias viviendas
    const dwellings = await Dwelling.find({
      ownerUserId: req.userId,
      isActive: true
    }).populate('ownerUserId', 'fullName email');

    res.json({ success: true, data: dwellings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDwellingById = async (req, res) => {
  try {
    // Presidente puede ver cualquier vivienda de su comunidad
    if (req.userRole === 'president') {
      const dwelling = await Dwelling.findOne({
        _id: req.params.id,
        communityId: req.communityId,
        isActive: true
      }).populate('ownerUserId', 'fullName email');

      if (!dwelling) {
        return res.status(404).json({ success: false, message: 'Vivienda no encontrada' });
      }
      return res.json({ success: true, data: dwelling });
    }

    // Otros roles solo pueden ver sus propias viviendas
    const dwelling = await Dwelling.findOne({
      _id: req.params.id,
      ownerUserId: req.userId,
      isActive: true
    }).populate('ownerUserId', 'fullName email');

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
    const dwelling = await Dwelling.create({
      ...req.validatedBody,
      communityId: req.communityId,
      ownerUserId: req.userId
    });
    res.status(201).json({ success: true, data: dwelling });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDwelling = async (req, res) => {
  try {
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

    // Otros roles solo pueden actualizar sus propias viviendas
    const dwelling = await Dwelling.findOneAndUpdate(
      { _id: req.params.id, ownerUserId: req.userId, communityId: req.communityId },
      req.validatedBody,
      { new: true, runValidators: true }
    );

    if (!dwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada' });
    }
    res.json({ success: true, data: dwelling });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDwelling = async (req, res) => {
  try {
    // Presidente puede eliminar cualquier vivienda de su comunidad
    if (req.userRole === 'president') {
      const dwelling = await Dwelling.findOneAndUpdate(
        { _id: req.params.id, communityId: req.communityId },
        { isActive: false },
        { new: true }
      );

      if (!dwelling) {
        return res.status(404).json({ success: false, message: 'Vivienda no encontrada en tu comunidad' });
      }
      return res.json({ success: true, message: 'Vivienda eliminada correctamente' });
    }

    // Otros roles solo pueden eliminar sus propias viviendas
    const dwelling = await Dwelling.findOneAndUpdate(
      { _id: req.params.id, ownerUserId: req.userId, communityId: req.communityId },
      { isActive: false },
      { new: true }
    );

    if (!dwelling) {
      return res.status(404).json({ success: false, message: 'Vivienda no encontrada' });
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
    const dwelling = await Dwelling.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      { approvedByPresident: status },
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
    const dwelling = await Dwelling.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      { approvedByTreasurer: status },
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
    const dwelling = await Dwelling.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      { approvedBySecretary: status },
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
