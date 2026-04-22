import User from '../models/user.model.js';
import Community from '../models/community.model.js';
import Role from '../models/role.model.js';

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
 * Endpoint público - devuelve todos los usuarios activos (sin filtro por comunidad)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
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
    // Verificar que el usuario pertenezca a la misma comunidad
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, communityId: req.communityId },
      req.validatedBody,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado en tu comunidad' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    // Verificar que el usuario pertenezca a la misma comunidad
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
