import Resident from '../models/resident.model.js';
import Dwelling from '../models/dwelling.model.js';
import Letter from '../models/letter.model.js';
import mongoose from 'mongoose';
import { createNotification } from './notification.controller.js';
import User from '../models/user.model.js';

/**
 * Obtener conteo de solicitudes pendientes para dashboard
 */
export const getPendingCount = async (req, res) => {
  try {
    const communityId = new mongoose.Types.ObjectId(req.communityId);

    const [pendingResidents, pendingDwellings, pendingLetters] = await Promise.all([
      Resident.countDocuments({
        communityId,
        status: 'pending',
        isActive: true
      }),
      Dwelling.countDocuments({
        communityId,
        status: 'pending',
        isActive: true
      }),
      Letter.countDocuments({
        communityId,
        status: 'pending',
        isActive: true
      })
    ]);

    res.json({
      success: true,
      data: {
        residents: pendingResidents,
        dwellings: pendingDwellings,
        letters: pendingLetters,
        total: pendingResidents + pendingDwellings + pendingLetters
      }
    });
  } catch (error) {
    console.error('Error al obtener conteo pendiente:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes pendientes' });
  }
};

/**
 * Obtener lista detallada de solicitudes pendientes
 */
export const getPendingRequests = async (req, res) => {
  try {
    const communityId = new mongoose.Types.ObjectId(req.communityId);

    const [residents, dwellings, letters] = await Promise.all([
      Resident.find({ communityId, status: 'pending', isActive: true })
        .populate('userId', 'fullName documentNumber email')
        .populate('dwellingId', 'houseNomenclature')
        .sort({ createdAt: -1 })
        .limit(50),
      Dwelling.find({ communityId, status: 'pending', isActive: true })
        .populate('ownerUserId', 'fullName email')
        .populate('createdBy', 'fullName')
        .sort({ createdAt: -1 })
        .limit(50),
      Letter.find({ communityId, status: 'pending', isActive: true })
        .populate('userId', 'fullName email')
        .populate('residentId')
        .sort({ createdAt: -1 })
        .limit(50)
    ]);

    res.json({
      success: true,
      data: {
        residents,
        dwellings,
        letters
      }
    });
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes pendientes' });
  }
};

/**
 * Aprobar/rechazar solicitud de residente
 */
export const approveResident = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' o 'rejected'
    const { id } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const resident = await Resident.findOne({
      _id: id,
      communityId: req.communityId,
      isActive: true
    });

    if (!resident) {
      return res.status(404).json({ message: 'Residente no encontrado' });
    }

    // Asignar aprobación según el rol del usuario que solicita
    let updateData = {};
    if (req.userRole === 'president') {
      updateData.approvedByPresident = status;
    } else if (req.userRole === 'tesorero') {
      updateData.approvedByTreasurer = status;
    } else if (req.userRole === 'secretario') {
      updateData.approvedBySecretary = status;
    } else {
      return res.status(403).json({ message: 'No tienes permiso para aprobar residentes' });
    }

    // Calcular nuevo status basado en todas las aprobaciones
    const newApprovals = [
      updateData.approvedByPresident || resident.approvedByPresident || 'pending',
      updateData.approvedByTreasurer || resident.approvedByTreasurer || 'pending',
      updateData.approvedBySecretary || resident.approvedBySecretary || 'pending'
    ];

    if (newApprovals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (newApprovals.every(a => a === 'approved')) {
      updateData.status = 'approved';
    }

    const updatedResident = await Resident.findOneAndUpdate(
      { _id: id, communityId: req.communityId },
      updateData,
      { new: true }
    );

    // Notificar al creador del residente sobre la aprobación/rechazo
    if (updatedResident.createdBy) {
      await createNotification({
        userId: updatedResident.createdBy,
        communityId: req.communityId,
        type: 'resident_approval',
        title: status === 'approved' ? 'Residente aprobado' : 'Residente rechazado',
        message: `Un administrador ${status === 'approved' ? 'aprobó' : 'rechazó'} al residente ${updatedResident.userId?.fullName || 'registrado'}`,
        entity: 'resident',
        entityId: updatedResident._id,
        actionUrl: `/residents/${updatedResident._id}`
      });
    }

    res.json({
      success: true,
      message: `Voto registrado: ${status === 'approved' ? 'APROBADO' : 'RECHAZADO'}`,
      data: updatedResident
    });
  } catch (error) {
    console.error('Error al aprobar residente:', error);
    res.status(500).json({ message: 'Error al aprobar residente' });
  }
};

/**
 * Aprobar/rechazar solicitud de vivienda
 */
export const approveDwelling = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const dwelling = await Dwelling.findOne({
      _id: id,
      communityId: req.communityId,
      isActive: true
    });

    if (!dwelling) {
      return res.status(404).json({ message: 'Vivienda no encontrada' });
    }

    let updateData = {};
    if (req.userRole === 'president') {
      updateData.approvedByPresident = status;
    } else if (req.userRole === 'tesorero') {
      updateData.approvedByTreasurer = status;
    } else if (req.userRole === 'secretario') {
      updateData.approvedBySecretary = status;
    } else {
      return res.status(403).json({ message: 'No tienes permiso para aprobar viviendas' });
    }

    // Calcular nuevo status basado en todas las aprobaciones
    const newApprovals = [
      updateData.approvedByPresident || dwelling.approvedByPresident || 'pending',
      updateData.approvedByTreasurer || dwelling.approvedByTreasurer || 'pending',
      updateData.approvedBySecretary || dwelling.approvedBySecretary || 'pending'
    ];

    if (newApprovals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (newApprovals.every(a => a === 'approved')) {
      updateData.status = 'approved';
    }

    const updatedDwelling = await Dwelling.findOneAndUpdate(
      { _id: id, communityId: req.communityId },
      updateData,
      { new: true }
    );

    // Notificar al creador de la vivienda sobre la aprobación/rechazo
    if (updatedDwelling.createdBy) {
      await createNotification({
        userId: updatedDwelling.createdBy,
        communityId: req.communityId,
        type: 'dwelling_approval',
        title: status === 'approved' ? 'Vivienda aprobada' : 'Vivienda rechazada',
        message: `Un administrador ${status === 'approved' ? 'aprobó' : 'rechazó'} la vivienda ${updatedDwelling.houseNomenclature || 'solicitada'}`,
        entity: 'dwelling',
        entityId: updatedDwelling._id,
        actionUrl: `/dwellings/${updatedDwelling._id}`
      });
    }

    res.json({
      success: true,
      message: `Voto registrado: ${status === 'approved' ? 'APROBADO' : 'RECHAZADO'}`,
      data: updatedDwelling
    });
  } catch (error) {
    console.error('Error al aprobar vivienda:', error);
    res.status(500).json({ message: 'Error al aprobar vivienda' });
  }
};

/**
 * Aprobar/rechazar carta juramentada
 */
export const approveLetter = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const letter = await Letter.findOne({
      _id: id,
      communityId: req.communityId,
      isActive: true
    });

    if (!letter) {
      return res.status(404).json({ message: 'Carta no encontrada' });
    }

    if (req.userRole === 'president') {
      letter.approvedByPresident = status;
    } else if (req.userRole === 'tesorero') {
      letter.approvedByTreasurer = status;
    } else if (req.userRole === 'secretario') {
      letter.approvedBySecretary = status;
    } else {
      return res.status(403).json({ message: 'No tienes permiso para aprobar cartas' });
    }

    await letter.save();

    // Notificar al usuario que solicitó la carta
    await createNotification({
      userId: letter.userId,
      communityId: req.communityId,
      type: 'letter_approval',
      title: status === 'approved' ? 'Carta aprobada' : 'Carta rechazada',
      message: `Un administrador ${status === 'approved' ? 'aprobó' : 'rechazó'} tu solicitud de carta ${letter.type}`,
      entity: 'letter',
      entityId: letter._id,
      actionUrl: `/letters/${letter._id}`
    });

    res.json({
      success: true,
      message: `Voto registrado: ${status === 'approved' ? 'APROBADO' : 'RECHAZADO'}`,
      data: letter
    });
  } catch (error) {
    console.error('Error al aprobar carta:', error);
    res.status(500).json({ message: 'Error al aprobar carta' });
  }
};
