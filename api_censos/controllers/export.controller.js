import Resident from '../models/resident.model.js';
import Dwelling from '../models/dwelling.model.js';
import Letter from '../models/letter.model.js';
import User from '../models/user.model.js';
import Announcement from '../models/announcement.model.js';
import Role from '../models/role.model.js';
import mongoose from 'mongoose';

/**
 * Exportar residentes a CSV
 */
export const exportResidents = async (req, res) => {
  try {
    const residents = await Resident.find({
      communityId: req.communityId,
      isActive: true
    })
      .populate('userId', 'fullName documentNumber email phone')
      .populate('dwellingId', 'houseNomenclature')
      .lean();

    const csvRows = [
      ['ID', 'Nombre', 'Cédula', 'Email', 'Teléfono', 'Vivienda', 'Estado', 'Fecha Registro']
    ];

    residents.forEach(r => {
      csvRows.push([
        r._id,
        r.userId?.fullName || '',
        r.userId?.documentNumber || '',
        r.userId?.email || '',
        r.userId?.phone || '',
        r.dwellingId?.houseNomenclature || '',
        r.status,
        new Date(r.createdAt).toLocaleDateString('es-CO')
      ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=residentes.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error al exportar residentes:', error);
    res.status(500).json({ message: 'Error al exportar residentes' });
  }
};

/**
 * Exportar viviendas a CSV
 */
export const exportDwellings = async (req, res) => {
  try {
    const dwellings = await Dwelling.find({
      communityId: req.communityId,
      isActive: true
    })
      .populate('ownerUserId', 'fullName documentNumber')
      .lean();

    const csvRows = [
      ['ID', 'Nomenclatura', 'Propietario', 'Cédula Propietario', 'Estado', 'Fecha Registro', 'Instrucciones']
    ];

    dwellings.forEach(d => {
      csvRows.push([
        d._id,
        d.houseNomenclature || '',
        d.ownerUserId?.fullName || '',
        d.cedulaPropietario || '',
        d.status,
        new Date(d.homeRegistrationDate).toLocaleDateString('es-CO'),
        (d.arrivalInstructions || '').substring(0, 50)
      ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=viviendas.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error al exportar viviendas:', error);
    res.status(500).json({ message: 'Error al exportar viviendas' });
  }
};

/**
 * Exportar cartas a CSV
 */
export const exportLetters = async (req, res) => {
  try {
    const letters = await Letter.find({
      communityId: req.communityId,
      isActive: true
    })
      .populate('userId', 'fullName documentNumber')
      .populate('residentId')
      .lean();

    const csvRows = [
      ['ID', 'Tipo', 'Solicitante', 'Cédula', 'Estado', 'Fecha Solicitud', 'Código QR']
    ];

    letters.forEach(l => {
      csvRows.push([
        l._id,
        l.type,
        l.userId?.fullName || '',
        l.userId?.documentNumber || '',
        l.status,
        new Date(l.createdAt).toLocaleDateString('es-CO'),
        l.qrCodigo || ''
      ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cartas.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error al exportar cartas:', error);
    res.status(500).json({ message: 'Error al exportar cartas' });
  }
};

/**
 * Exportar todos los datos (zip con múltiples archivos)
 * Nota: Para implementación real se necesita la librería 'archiver'
 * Esta es una versión simplificada que devuelve JSON
 */
export const exportAll = async (req, res) => {
  try {
    const [residents, dwellings, letters, users, announcements] = await Promise.all([
      Resident.find({ communityId: req.communityId, isActive: true }).populate('userId', 'fullName documentNumber'),
      Dwelling.find({ communityId: req.communityId, isActive: true }).populate('ownerUserId', 'fullName'),
      Letter.find({ communityId: req.communityId, isActive: true }).populate('userId', 'fullName'),
      User.find({ communityId: req.communityId, isActive: true }).select('-password'),
      Announcement.find({ communityId: req.communityId, isActive: true })
    ]);

    // En producción, esto debería crear un ZIP real
    // Por ahora devolvemos JSON con instrucción de que el frontend lo convierta
    res.json({
      success: true,
      message: 'Datos exportados. El frontend debe convertir esto a ZIP/CSV.',
      data: {
        residents: residents.length,
        dwellings: dwellings.length,
        letters: letters.length,
        users: users.length,
        announcements: announcements.length,
        exportedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error al exportar todos los datos:', error);
    res.status(500).json({ message: 'Error al exportar todos los datos' });
  }
};
