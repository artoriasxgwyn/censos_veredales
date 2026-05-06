import mongoose from 'mongoose';
import Letter from '../models/letter.model.js';
import Resident from '../models/resident.model.js';
import Community from '../models/community.model.js';
import User from '../models/user.model.js';
import Role from '../models/role.model.js';
import { v4 as uuidv4 } from 'uuid';
import { notifyAllAdmins } from './notification.controller.js';

/**
 * Solicitar nueva carta (normal o juramentada)
 * - Carta normal: requiere residente aprobado y permiso letter:generateNormal
 * - Carta juramentada: requiere al menos 1 año de antigüedad y permiso letter:generateJuramentada
 */
export const requestLetter = async (req, res) => {
  try {
    const { type, residentId } = req.body;

    // Validar permiso según el tipo de carta
    const requiredPermission = type === 'juramentada' ? 'generateJuramentada' : 'generateNormal';

    // El presidente tiene todos los permisos por defecto
    if (req.userRole !== 'president') {
      const Role = mongoose.model('Role');
      const userRole = await Role.findOne({
        communityId: req.communityId,
        name: req.userRole,
        isActive: true
      });

      if (!userRole || !userRole.permissions.letter[requiredPermission]) {
        return res.status(403).json({
          message: `No tienes permiso para solicitar carta ${type}`
        });
      }
    }

    // Validar que el residente existe y está aprobado
    const resident = await Resident.findOne({
      _id: residentId,
      communityId: req.communityId,
      status: 'approved'
    });

    if (!resident) {
      return res.status(404).json({
        message: 'Residente no encontrado o no aprobado'
      });
    }

    // Validar que el residente pertenece al usuario que solicita
    if (resident.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: 'No puedes solicitar una carta para este residente'
      });
    }

    // Para carta juramentada, verificar 1 año de antigüedad (excepto para presidente)
    if (type === 'juramentada' && req.userRole !== 'president') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (resident.createdAt > oneYearAgo) {
        return res.status(400).json({
          message: 'El residente debe tener al menos 1 año de antigüedad para solicitar carta juramentada'
        });
      }
    }

    // Presidente crea cartas normales directamente (issued)
    // Cartas juramentadas y cartas de otros roles quedan pendientes de 3 aprobaciones
    const initialStatus = (type === 'normal' && req.userRole === 'president')
      ? 'issued'
      : 'pending';

    const initialApprovals = req.userRole === 'president'
      ? {
          approvedByPresident: 'approved',
          approvedByTreasurer: 'approved',
          approvedBySecretary: 'approved',
          status: 'issued'
        }
      : {
          approvedByPresident: 'pending',
          approvedByTreasurer: 'pending',
          approvedBySecretary: 'pending',
          status: 'pending'
        };

    // Crear carta con código QR único
    const letter = await Letter.create({
      userId: req.userId,
      residentId,
      communityId: req.communityId,
      type,
      createdBy: req.userId,
      qrCodigo: `LETTER-${uuidv4().slice(0, 8).toUpperCase()}`,
      ...initialApprovals
    });

    // Notificar a los admins si la carta queda pendiente (no fue creada por presidente)
    if (req.userRole !== 'president') {
      await notifyAllAdmins({
        communityId: req.communityId,
        type: 'letter_approval',
        title: `Nueva carta ${type} pendiente de aprobación`,
        message: `Se ha solicitado una carta ${type}. Requiere tu aprobación.`,
        entity: 'letter',
        entityId: letter._id,
        actionUrl: `/letters/${letter._id}`
      });
    }

    res.status(201).json({
      success: true,
      data: letter
    });
  } catch (error) {
    console.error('Error al solicitar carta:', error);
    res.status(500).json({
      message: 'Error al solicitar la carta'
    });
  }
};

/**
 * Obtener todas las cartas del usuario actual
 */
export const getMyLetters = async (req, res) => {
  try {
    const letters = await Letter.find({
      userId: req.userId,
      communityId: req.communityId,
      isActive: true
    })
      .populate('residentId', 'userId')
      .populate('communityId', 'neighborhood city code');

    res.json({
      success: true,
      data: letters
    });
  } catch (error) {
    console.error('Error al obtener cartas:', error);
    res.status(500).json({
      message: 'Error al obtener las cartas'
    });
  }
};

/**
 * Obtener todas las cartas de la comunidad (Presidente, Secretario y Tesorero ven todas)
 */
export const getCommunityLetters = async (req, res) => {
  try {
    // Presidente, Secretario y Tesorero ven todas las cartas de su comunidad
    if (req.userRole === 'president' || req.userRole === 'secretario' || req.userRole === 'tesorero') {
      const letters = await Letter.find({
        communityId: req.communityId,
        isActive: true
      })
        .populate('userId', 'fullName email')
        .populate('residentId', 'userId')
        .populate('communityId', 'neighborhood city code')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: letters
      });
    }

    return res.status(403).json({
      message: 'No tienes permiso para ver las cartas de la comunidad'
    });
  } catch (error) {
    console.error('Error al obtener cartas de la comunidad:', error);
    res.status(500).json({
      message: 'Error al obtener las cartas de la comunidad'
    });
  }
};

/**
 * Obtener carta por ID
 */
export const getLetterById = async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    })
      .populate('communityId', 'neighborhood city code');

    if (!letter) {
      return res.status(404).json({
        message: 'Carta no encontrada'
      });
    }

    // Verificar que el usuario es el dueño o es presidente
    if (letter.userId.toString() !== req.userId && req.userRole !== 'president') {
      return res.status(403).json({
        message: 'No tienes permiso para ver esta carta'
      });
    }

    res.json({
      success: true,
      data: letter
    });
  } catch (error) {
    console.error('Error al obtener carta:', error);
    res.status(500).json({
      message: 'Error al obtener la carta'
    });
  }
};

/**
 * Presidente aprueba carta
 */
export const approveByPresident = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Estado inválido'
      });
    }

    const letter = await Letter.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!letter) {
      return res.status(404).json({
        message: 'Carta no encontrada'
      });
    }

    const updateData = { approvedByPresident: status };
    const approvals = [status, letter.approvedByTreasurer || 'pending', letter.approvedBySecretary || 'pending'];

    if (approvals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (approvals.every(a => a === 'approved')) {
      updateData.status = 'issued'; // Carta aprobada se emite automáticamente
    }

    const updatedLetter = await Letter.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      data: updatedLetter
    });
  } catch (error) {
    console.error('Error al aprobar carta (presidente):', error);
    res.status(500).json({
      message: 'Error al aprobar la carta'
    });
  }
};

/**
 * Tesorero aprueba carta
 */
export const approveByTreasurer = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Estado inválido'
      });
    }

    const letter = await Letter.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!letter) {
      return res.status(404).json({
        message: 'Carta no encontrada'
      });
    }

    const updateData = { approvedByTreasurer: status };
    const approvals = [letter.approvedByPresident || 'pending', status, letter.approvedBySecretary || 'pending'];

    if (approvals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (approvals.every(a => a === 'approved')) {
      updateData.status = 'issued'; // Carta aprobada se emite automáticamente
    }

    const updatedLetter = await Letter.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      data: updatedLetter
    });
  } catch (error) {
    console.error('Error al aprobar carta (tesorero):', error);
    res.status(500).json({
      message: 'Error al aprobar la carta'
    });
  }
};

/**
 * Secretario aprueba carta
 */
export const approveBySecretary = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Estado inválido'
      });
    }

    const letter = await Letter.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!letter) {
      return res.status(404).json({
        message: 'Carta no encontrada'
      });
    }

    const updateData = { approvedBySecretary: status };
    const approvals = [letter.approvedByPresident || 'pending', letter.approvedByTreasurer || 'pending', status];

    if (approvals.some(a => a === 'rejected')) {
      updateData.status = 'rejected';
    } else if (approvals.every(a => a === 'approved')) {
      updateData.status = 'issued'; // Carta aprobada se emite automáticamente
    }

    const updatedLetter = await Letter.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      data: updatedLetter
    });
  } catch (error) {
    console.error('Error al aprobar carta (secretario):', error);
    res.status(500).json({
      message: 'Error al aprobar la carta'
    });
  }
};

/**
 * Obtener estado de aprobación de una carta
 */
export const getApprovalStatus = async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!letter) {
      return res.status(404).json({
        message: 'Carta no encontrada'
      });
    }

    const approvals = {
      president: letter.approvedByPresident === 'approved',
      treasurer: letter.approvedByTreasurer === 'approved',
      secretary: letter.approvedBySecretary === 'approved',
      count: [
        letter.approvedByPresident,
        letter.approvedByTreasurer,
        letter.approvedBySecretary
      ].filter(s => s === 'approved').length,
      isFullyApproved:
        letter.approvedByPresident === 'approved' &&
        letter.approvedByTreasurer === 'approved' &&
        letter.approvedBySecretary === 'approved'
    };

    res.json({
      success: true,
      data: {
        letter,
        approvals
      }
    });
  } catch (error) {
    console.error('Error al obtener estado de aprobación:', error);
    res.status(500).json({
      message: 'Error al obtener el estado de aprobación'
    });
  }
};

/**
 * Generar PDF de carta (cuando está aprobada)
 * TODO: Implementar generación de PDF con firmas digitales
 */
export const generatePdf = async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    }).populate('userId').populate('residentId');

    if (!letter) {
      return res.status(404).json({
        message: 'Carta no encontrada'
      });
    }

    // Verificar que la carta está aprobada
    if (letter.status !== 'approved') {
      return res.status(400).json({
        message: 'La carta debe estar aprobada por los 3 administradores para generar el PDF'
      });
    }

    // TODO: Generar PDF con:
    // - Encabezado de la comunidad
    // - Datos del residente
    // - Tipo de carta
    // - Firmas digitales de los 3 administradores
    // - Código QR

    res.json({
      success: true,
      message: 'PDF generado (pendiente de implementación)',
      data: {
        pdfUrl: letter.pdfUrl,
        qrUrl: letter.qrUrl
      }
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({
      message: 'Error al generar el PDF'
    });
  }
};

/**
 * Descargar PDF de carta
 */
export const downloadPdf = async (req, res) => {
  try {
    const letter = await Letter.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!letter || !letter.pdfUrl) {
      return res.status(404).json({
        message: 'PDF no disponible'
      });
    }

    // Solo presidente o el dueño de la carta pueden descargar
    if (req.userRole !== 'president' && letter.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: 'No tienes permiso para descargar esta carta'
      });
    }

    // Redirigir al PDF almacenado
    res.redirect(letter.pdfUrl);
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    res.status(500).json({
      message: 'Error al descargar el PDF'
    });
  }
};

/**
 * Verificar carta por código QR (endpoint público)
 */
export const verifyByQr = async (req, res) => {
  try {
    const { qrCodigo } = req.params;

    const letter = await Letter.findOne({
      qrCodigo,
      isActive: true
    })
      .populate('userId', 'fullName documentNumber email')
      .populate('residentId')
      .populate('communityId', 'neighborhood city code');

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Código QR inválido o no encontrado'
      });
    }

    // Solo mostrar información si la carta está emitida
    if (letter.status !== 'issued') {
      return res.status(400).json({
        success: false,
        message: 'Esta carta aún no ha sido emitida oficialmente'
      });
    }

    res.json({
      success: true,
      data: {
        qrCodigo: letter.qrCodigo,
        type: letter.type,
        issuedAt: letter.issuedAt,
        resident: letter.residentId,
        user: letter.userId,
        community: letter.communityId
      }
    });
  } catch (error) {
    console.error('Error al verificar QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el código QR'
    });
  }
};
