import Announcement from '../models/announcement.model.js';
import Community from '../models/community.model.js';

/**
 * Crear nuevo anuncio (solo presidente y roles con permiso)
 */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, header, body, images } = req.body;

    const announcement = await Announcement.create({
      title,
      header,
      body,
      images: images || [],
      createdBy: req.userId,
      communityId: req.communityId
    });

    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error al crear anuncio:', error);
    res.status(500).json({
      message: 'Error al crear el anuncio'
    });
  }
};

/**
 * Obtener todos los anuncios activos de la comunidad
 */
export const getCommunityAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      communityId: req.communityId,
      isActive: true,
      publishedAt: { $lte: new Date() }
    })
      .populate('createdBy', 'fullName')
      .sort({ publishedAt: -1, createdAt: -1 });

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    res.status(500).json({
      message: 'Error al obtener los anuncios'
    });
  }
};

/**
 * Obtener anuncio por ID
 */
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    }).populate('createdBy', 'fullName email');

    if (!announcement) {
      return res.status(404).json({
        message: 'Anuncio no encontrado'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error al obtener anuncio:', error);
    res.status(500).json({
      message: 'Error al obtener el anuncio'
    });
  }
};

/**
 * Actualizar anuncio
 */
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, header, body, images, publishedAt } = req.body;

    const announcement = await Announcement.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!announcement) {
      return res.status(404).json({
        message: 'Anuncio no encontrado'
      });
    }

    // Solo el creador o presidente puede editar
    if (announcement.createdBy.toString() !== req.userId && req.userRole !== 'president') {
      return res.status(403).json({
        message: 'No tienes permiso para editar este anuncio'
      });
    }

    announcement.title = title || announcement.title;
    announcement.header = header || announcement.header;
    announcement.body = body || announcement.body;
    announcement.images = images || announcement.images;
    announcement.publishedAt = publishedAt || announcement.publishedAt;

    await announcement.save();

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    res.status(500).json({
      message: 'Error al actualizar el anuncio'
    });
  }
};

/**
 * Eliminar anuncio (soft delete)
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!announcement) {
      return res.status(404).json({
        message: 'Anuncio no encontrado'
      });
    }

    // Solo el creador o presidente puede eliminar
    if (announcement.createdBy.toString() !== req.userId && req.userRole !== 'president') {
      return res.status(403).json({
        message: 'No tienes permiso para eliminar este anuncio'
      });
    }

    announcement.isActive = false;
    await announcement.save();

    res.json({
      success: true,
      message: 'Anuncio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    res.status(500).json({
      message: 'Error al eliminar el anuncio'
    });
  }
};

/**
 * Publicar anuncio (establecer publishedAt)
 */
export const publishAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!announcement) {
      return res.status(404).json({
        message: 'Anuncio no encontrado'
      });
    }

    // Solo el creador o presidente puede publicar
    if (announcement.createdBy.toString() !== req.userId && req.userRole !== 'president') {
      return res.status(403).json({
        message: 'No tienes permiso para publicar este anuncio'
      });
    }

    announcement.publishedAt = new Date();
    await announcement.save();

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error al publicar anuncio:', error);
    res.status(500).json({
      message: 'Error al publicar el anuncio'
    });
  }
};
