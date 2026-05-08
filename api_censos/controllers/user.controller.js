import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Community from '../models/community.model.js';
import Role from '../models/role.model.js';
import { createNotification } from '../controllers/notification.controller.js';

const BOARD_ROLES = ['president', 'tesorero', 'secretario'];

/**
 * Verificar que un rol de junta directiva no este ya ocupado en la comunidad.
 * Devuelve un mensaje de error si ya existe otro usuario con ese rol, o null si esta disponible.
 */
const checkUniqueBoardRole = async (roleName, communityId, excludeUserId = null) => {
  if (!BOARD_ROLES.includes(roleName)) return null;

  const query = {
    role: roleName,
    communityId,
    isActive: true
  };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existing = await User.findOne(query);
  if (existing) {
    const roleLabel = roleName === 'president' ? 'presidente'
      : roleName === 'tesorero' ? 'tesorero'
      : 'secretario';
    return `Ya existe un ${roleLabel} en esta comunidad. Debes remover al actual antes de asignar uno nuevo.`;
  }
  return null;
};

/**
 * Crear usuario con rol (solo presidente)
 */
export const createUser = async (req, res) => {
  try {
    const { fullName, documentNumber, birthDate, phone, email, password, role: roleName } = req.body;

    // Verificar que el rol existe en esta comunidad
    const roleDoc = await Role.findOne({
      communityId: req.communityId,
      $or: [
        { name: roleName },
        { customName: roleName }
      ],
      isActive: true
    });

    if (!roleDoc) {
      return res.status(404).json({
        success: false,
        message: `El rol "${roleName}" no existe o está inactivo en tu comunidad`
      });
    }

    // Verificar email duplicado
    const existingEmail = await User.findOne({
      email,
      communityId: req.communityId,
      isActive: true
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email en tu comunidad'
      });
    }

    // Verificar que no haya otro usuario con el mismo rol de junta directiva
    const uniqueError = await checkUniqueBoardRole(roleDoc.name, req.communityId);
    if (uniqueError) {
      return res.status(409).json({ success: false, message: uniqueError });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario activo inmediatamente
    const user = await User.create({
      fullName,
      documentNumber,
      birthDate,
      phone,
      email,
      password: hashedPassword,
      role: roleDoc.customName || roleDoc.name,
      communityId: req.communityId,
      isActive: true
    });

    // Si es rol de junta directiva, actualizar Community
    if (['president', 'tesorero', 'secretario'].includes(roleDoc.name)) {
      const communityField = roleDoc.name === 'president' ? 'presidentId'
        : roleDoc.name === 'tesorero' ? 'treasurerId' : 'secretaryId';

      await Community.findByIdAndUpdate(
        req.communityId,
        { [communityField]: user._id }
      );
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Subir/actualizar firma digital
 */
export const uploadSignature = async (req, res) => {
  try {
    const { signatureData } = req.body; // dataURL de la firma

    if (!signatureData) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó la firma'
      });
    }

    // Presidente puede subir firma de cualquiera, otros solo la suya
    const userId = req.userRole === 'president' ? req.params.id : req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { digitalSignature: signatureData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Firma digital guardada exitosamente',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    // Si es presidente, puede ver todos los usuarios de su comunidad
    if (req.userRole === 'president') {
      const users = await User.find({ communityId: req.communityId, isActive: true }).select('-password');
      return res.json({ success: true, data: users });
    }

    // Otros roles solo ven su propia información
    const currentUser = await User.findById(req.userId).select('-password');
    res.json({ success: true, data: [currentUser] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Endpoint público - devuelve todos los usuarios activos de la comunidad
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      communityId: req.communityId,
      isActive: true
    }).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    // Verificar que el usuario pertenezca a la misma comunidad
    const user = await User.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignRole = async (req, res) => {
  try {
    const { role } = req.validatedBody;
    const { id } = req.params;

    // Verificar que el rol exista y esté activo en la comunidad
    const roleDoc = await Role.findOne({
      communityId: req.communityId,
      $or: [
        { name: role },
        { customName: role }
      ],
      isActive: true
    });

    if (!roleDoc) {
      return res.status(404).json({
        success: false,
        message: `El rol "${role}" no existe o está inactivo en tu comunidad`
      });
    }

    const user = await User.findOne({
      _id: id,
      communityId: req.communityId,
      isActive: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado en tu comunidad' });
    }

    // Verificar que no haya otro usuario con el mismo rol de junta directiva
    const uniqueError = await checkUniqueBoardRole(roleDoc.name, req.communityId, id);
    if (uniqueError) {
      return res.status(409).json({ success: false, message: uniqueError });
    }

    // Actualizar rol del usuario
    user.role = roleDoc.customName || roleDoc.name;
    await user.save();

    // Si es rol de junta directiva, actualizar referencia en Community
    if (['president', 'tesorero', 'secretario'].includes(roleDoc.name)) {
      const communityField = roleDoc.name === 'president' ? 'presidentId'
        : roleDoc.name === 'tesorero' ? 'treasurerId' : 'secretaryId';

      await Community.findByIdAndUpdate(
        req.communityId,
        { [communityField]: user._id }
      );
    }

    res.json({
      success: true,
      data: {
        user,
        message: `Rol ${user.role} asignado exitosamente`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeRole = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      communityId: req.communityId,
      isActive: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado en tu comunidad' });
    }

    // Evitar que el presidente se quite su propio rol
    if (req.userId === user._id.toString() && user.role === 'president') {
      return res.status(403).json({ success: false, message: 'No puedes remover tu propio rol de presidente. Se requiere que otro administrador lo haga.' });
    }

    // Guardar rol anterior para limpiar referencia en Community
    const previousRole = user.role;
    user.role = null;
    await user.save();

    // Limpiar referencia en Community si era rol de junta directiva
    if (['president', 'tesorero', 'secretario'].includes(previousRole)) {
      const communityField = previousRole === 'president' ? 'presidentId'
        : previousRole === 'tesorero' ? 'treasurerId' : 'secretaryId';

      await Community.findByIdAndUpdate(
        req.communityId,
        { [communityField]: null }
      );
    }

    res.json({
      success: true,
      data: {
        user,
        message: 'Rol removido exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    // Presidente puede actualizar cualquier usuario de su comunidad (cambio inmediato)
    if (req.userRole === 'president') {
      // Si se esta asignando un rol de junta directiva, verificar unicidad
      if (req.validatedBody.role && BOARD_ROLES.includes(req.validatedBody.role)) {
        const uniqueError = await checkUniqueBoardRole(req.validatedBody.role, req.communityId, req.params.id);
        if (uniqueError) {
          return res.status(409).json({ success: false, message: uniqueError });
        }
      }

      const user = await User.findOneAndUpdate(
        { _id: req.params.id, communityId: req.communityId },
        req.validatedBody,
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado en tu comunidad' });
      }

      return res.json({ success: true, data: user });
    }

    // Todos los demás roles (secretario, tesorero, residente, censista)
    // solo pueden SOLICITAR cambios a su propio perfil (requiere triple aprobación)
    if (req.params.id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar el perfil de otros usuarios'
      });
    }

    // Importar dinámicamente para evitar circular dependency
    const PendingProfileChange = (await import('../models/pendingProfileChange.model.js')).default;

    // Verificar que no haya otra solicitud pendiente
    const existingPending = await PendingProfileChange.findOne({
      userId: req.userId,
      status: 'pending'
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes una solicitud de cambio de perfil pendiente de aprobación'
      });
    }

    // Crear solicitud pendiente con triple aprobación
    const { fullName, documentNumber, birthDate, phone, email } = req.validatedBody;
    const pendingChange = await PendingProfileChange.create({
      userId: req.userId,
      communityId: req.communityId,
      requestedChanges: { fullName, documentNumber, birthDate, phone, email },
      status: 'pending',
      approvedByPresident: 'pending',
      approvedByTreasurer: 'pending',
      approvedBySecretary: 'pending'
    });

    // Obtener nombre del solicitante
    const requestingUser = await User.findById(req.userId).select('fullName');
    const requesterName = requestingUser?.fullName || 'Un usuario';

    // Notificar a todos los admins
    const admins = await User.find({
      communityId: req.communityId,
      role: { $in: ['president', 'tesorero', 'secretario'] },
      isActive: true
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        communityId: req.communityId,
        type: 'profile_change',
        title: 'Solicitud de cambio de perfil',
        message: `${requesterName} ha solicitado un cambio de perfil`,
        entity: 'profile',
        entityId: pendingChange._id,
        actionUrl: `/profile-changes/${pendingChange._id}`
      });
    }

    return res.status(202).json({
      success: true,
      data: pendingChange,
      message: 'Solicitud enviada. La junta directiva debe aprobar el cambio.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    // Solo presidente puede eliminar usuarios
    if (req.userRole !== 'president') {
      return res.status(403).json({
        success: false,
        message: 'Solo el presidente puede eliminar usuarios'
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado en tu comunidad' });
    }

    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cambiar contraseña
 * - Presidente: puede cambiar la suya propia o la de cualquier usuario (aplicación inmediata)
 * - Secretario/Tesorero/Residente: solo pueden solicitar cambio de su propia contraseña (requiere aprobación del presidente)
 */
export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.params;

    // Validar longitud de contraseña
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Presidente puede cambiar contraseña de cualquiera inmediatamente
    if (req.userRole === 'president') {
      const userId = id || req.userId;

      const user = await User.findOne({
        _id: userId,
        communityId: req.communityId,
        isActive: true
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.pendingPassword = null; // Limpiar pendiente si existe
      await user.save();

      return res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    }

    // Otros roles (secretario, tesorero, residente) solicitan cambio pendiente de aprobación
    const userId = req.userId;
    const user = await User.findOne({
      _id: userId,
      communityId: req.communityId,
      isActive: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Hashear y guardar como pendiente
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.pendingPassword = hashedPassword;
    await user.save();

    // Notificar al presidente
    const president = await User.findOne({
      communityId: req.communityId,
      role: 'president',
      isActive: true
    });

    if (president) {
      await createNotification({
        userId: president._id,
        communityId: req.communityId,
        type: 'password_change',
        title: 'Solicitud de cambio de contraseña',
        message: `${user.fullName} ha solicitado un cambio de contraseña`,
        entity: 'password',
        entityId: user._id,
        actionUrl: `/users/pending-passwords`
      });
    }

    res.json({
      success: true,
      message: 'Solicitud de cambio de contraseña enviada. El presidente debe aprobar el cambio.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Aprobar/rechazar cambio de contraseña pendiente (solo presidente)
 */
export const approvePasswordChange = async (req, res) => {
  try {
    const { userId, action } = req.body; // action: 'approve' o 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Acción inválida. Use "approve" o "reject"'
      });
    }

    const user = await User.findOne({
      _id: userId,
      communityId: req.communityId,
      isActive: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (!user.pendingPassword) {
      return res.status(400).json({
        success: false,
        message: 'Este usuario no tiene un cambio de contraseña pendiente'
      });
    }

    if (action === 'approve') {
      user.password = user.pendingPassword;
      user.pendingPassword = null;
      await user.save();

      // Notificar al usuario que su contraseña fue cambiada
      await createNotification({
        userId: user._id,
        communityId: req.communityId,
        type: 'password_change',
        title: 'Contraseña cambiada',
        message: 'El presidente ha aprobado tu solicitud de cambio de contraseña',
        entity: 'password',
        entityId: user._id,
        actionUrl: null
      });

      return res.json({
        success: true,
        message: 'Cambio de contraseña aprobado y aplicado'
      });
    } else {
      user.pendingPassword = null;
      await user.save();

      // Notificar al usuario que su solicitud fue rechazada
      await createNotification({
        userId: user._id,
        communityId: req.communityId,
        type: 'password_change',
        title: 'Cambio de contraseña rechazado',
        message: 'El presidente ha rechazado tu solicitud de cambio de contraseña',
        entity: 'password',
        entityId: user._id,
        actionUrl: null
      });

      return res.json({
        success: true,
        message: 'Cambio de contraseña rechazado'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtener usuarios con cambio de contraseña pendiente (solo presidente)
 */
export const getPendingPasswordChanges = async (req, res) => {
  try {
    const users = await User.find({
      communityId: req.communityId,
      pendingPassword: { $exists: true, $ne: null },
      isActive: true
    }).select('_id fullName email role pendingPassword');

    res.json({
      success: true,
      data: users.map(u => ({
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        hasPendingChange: true
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
