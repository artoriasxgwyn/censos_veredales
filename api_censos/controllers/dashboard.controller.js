import User from '../models/user.model.js';
import Resident from '../models/resident.model.js';
import Dwelling from '../models/dwelling.model.js';
import Letter from '../models/letter.model.js';
import Announcement from '../models/announcement.model.js';
import Community from '../models/community.model.js';
import mongoose from 'mongoose';

/**
 * Dashboard para administrador (presidente y junta)
 * Muestra estadísticas de la comunidad
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const communityId = req.communityId;

    // Contar residentes por estado
    const residentStats = await Resident.aggregate([
      { $match: { communityId: new mongoose.Types.ObjectId(communityId), isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Contar viviendas por estado
    const dwellingStats = await Dwelling.aggregate([
      { $match: { communityId: new mongoose.Types.ObjectId(communityId), isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Contar cartas por estado
    const letterStats = await Letter.aggregate([
      { $match: { communityId: new mongoose.Types.ObjectId(communityId), isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Cartas pendientes de aprobación
    const pendingLetters = await Letter.countDocuments({
      communityId: new mongoose.Types.ObjectId(communityId),
      status: 'pending',
      isActive: true
    });

    // Residentes pendientes de aprobación
    const pendingResidents = await Resident.countDocuments({
      communityId: new mongoose.Types.ObjectId(communityId),
      status: 'pending',
      isActive: true
    });

    // Viviendas pendientes de aprobación
    const pendingDwellings = await Dwelling.countDocuments({
      communityId: new mongoose.Types.ObjectId(communityId),
      status: 'pending',
      isActive: true
    });

    // Total de usuarios en la comunidad
    const totalUsers = await User.countDocuments({
      communityId: new mongoose.Types.ObjectId(communityId),
      isActive: true
    });

    // Últimos anuncios
    const recentAnnouncements = await Announcement.find({
      communityId: new mongoose.Types.ObjectId(communityId),
      isActive: true,
      publishedAt: { $lte: new Date() }
    })
      .sort({ publishedAt: -1 })
      .limit(5)
      .populate('createdBy', 'fullName');

    // Obtener información de la comunidad
    const community = await Community.findById(communityId).populate('presidentId treasurerId secretaryId');

    res.json({
      success: true,
      data: {
        community,
        stats: {
          residents: {
            total: residentStats.reduce((sum, s) => sum + s.count, 0),
            byStatus: residentStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
          },
          dwellings: {
            total: dwellingStats.reduce((sum, s) => sum + s.count, 0),
            byStatus: dwellingStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
          },
          letters: {
            total: letterStats.reduce((sum, s) => sum + s.count, 0),
            byStatus: letterStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
          },
          totalUsers,
          pending: {
            letters: pendingLetters,
            residents: pendingResidents,
            dwellings: pendingDwellings
          }
        },
        recentAnnouncements
      }
    });
  } catch (error) {
    console.error('Error al obtener dashboard de administrador:', error);
    res.status(500).json({
      message: 'Error al obtener el dashboard'
    });
  }
};

/**
 * Dashboard para residente
 * Muestra información personal y estado de trámites
 */
export const getResidentDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const communityId = req.communityId;

    // Información del usuario
    const user = await User.findById(userId).select('-password');

    // Residentes asociados al usuario
    const residents = await Resident.find({
      userId,
      communityId,
      isActive: true
    }).populate('dwellingId');

    // Cartas del usuario
    const letters = await Letter.find({
      userId,
      communityId,
      isActive: true
    }).sort({ createdAt: -1 });

    // Viviendas del usuario (por ownerUserId O por cedulaPropietario)
    const dwellings = await Dwelling.find({
      communityId,
      isActive: true,
      $or: [
        { ownerUserId: userId },
        { cedulaPropietario: user.documentNumber }
      ]
    });

    const myDwelling = dwellings[0] || null;

    // Anuncios recientes de la comunidad
    const recentAnnouncements = await Announcement.find({
      communityId,
      isActive: true,
      publishedAt: { $lte: new Date() }
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .populate('createdBy', 'fullName');

    // Contacto del presidente (phone desde User, no community.presidentWhatsApp)
    const community = await Community.findById(communityId).populate('presidentId', 'phone');
    const presidentContact = community?.presidentId?.phone || null;

    // Últimas 5 cartas del usuario
    const recentLetters = await Letter.find({
      userId,
      communityId,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Permisos del usuario
    const permissions = {
      canCreateLetter: letters.some(l => l.status === 'pending') === false,
      canViewDashboard: true,
      canManageResidents: residents.length > 0
    };

    res.json({
      success: true,
      data: {
        user,
        residents,
        letters,
        dwellings,
        myDwelling,
        presidentContact,
        recentLetters,
        recentAnnouncements,
        permissions
      }
    });
  } catch (error) {
    console.error('Error al obtener dashboard de residente:', error);
    res.status(500).json({
      message: 'Error al obtener el dashboard'
    });
  }
};

/**
 * Dashboard para censista
 * Muestra métricas de los registros realizados por el censista
 */
export const getCensusTakerDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const communityId = req.communityId;

    // Total viviendas registradas por el censista
    const myDwellings = await Dwelling.find({
      communityId: new mongoose.Types.ObjectId(communityId),
      createdBy: new mongoose.Types.ObjectId(userId),
      isActive: true
    });

    // Total residentes registrados por el censista
    const myResidents = await Resident.find({
      communityId: new mongoose.Types.ObjectId(communityId),
      createdBy: new mongoose.Types.ObjectId(userId),
      isActive: true
    }).populate('userId', 'fullName');

    // Pendientes de aprobación (de los registros del censista)
    const pendingDwellings = myDwellings.filter(d => d.status === 'pending').length;
    const pendingResidents = myResidents.filter(r => r.status === 'pending').length;

    // Últimos 5 registros (viviendas + residentes)
    const dwellingItems = myDwellings.map(d => ({
      _id: d._id,
      type: 'dwelling',
      name: d.houseNomenclature || 'Sin nomenclatura',
      status: d.status,
      createdAt: d.createdAt
    }));

    const residentItems = myResidents.map(r => ({
      _id: r._id,
      type: 'resident',
      name: r.userId?.fullName || 'Residente',
      status: r.status,
      createdAt: r.createdAt
    }));

    const recentRegistrations = [...dwellingItems, ...residentItems]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        stats: {
          myDwellings: myDwellings.length,
          myResidents: myResidents.length,
          pendingApprovals: pendingDwellings + pendingResidents
        },
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error al obtener dashboard de censista:', error);
    res.status(500).json({
      message: 'Error al obtener el dashboard'
    });
  }
};
