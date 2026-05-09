import Role from '../models/role.model.js';
import User from '../models/user.model.js';

// Obtener todos los roles de la comunidad del presidente
export const getCommunityRoles = async (req, res) => {
  try {
    const roles = await Role.find({
      communityId: req.communityId,
      isActive: true
    });

    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener un rol específico por ID
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      communityId: req.communityId,
      isActive: true
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Crear un nuevo rol personalizado
export const createRole = async (req, res) => {
  try {
    const { customName, permissions } = req.body;

    if (!customName) {
      return res.status(400).json({
        success: false,
        message: 'El nombre personalizado es requerido para roles custom'
      });
    }

    // Verificar que no exista un rol con el mismo nombre en esta comunidad
    const existingRole = await Role.findOne({
      communityId: req.communityId,
      customName
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un rol con este nombre en tu comunidad'
      });
    }

    const role = await Role.create({
      name: 'custom',
      customName,
      communityId: req.communityId,
      isBaseRole: false,
      permissions: permissions || {}
    });

    res.status(201).json({
      success: true,
      data: {
        role,
        message: 'Rol personalizado creado exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Actualizar permisos de un rol
export const updateRolePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const { id } = req.params;

    const role = await Role.findOne({
      _id: id,
      communityId: req.communityId,
      isActive: true
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    // No permitir modificar roles base si se intenta cambiar el nombre
    if (role.isBaseRole && req.body.customName) {
      return res.status(403).json({
        success: false,
        message: 'No se puede modificar el nombre de un rol base'
      });
    }

    // Actualizar permisos
    if (permissions) {
      role.permissions = { ...role.permissions, ...permissions };
    }

    await role.save();

    res.json({
      success: true,
      data: {
        role,
        message: 'Permisos actualizados exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar rol personalizado (solo si no tiene usuarios asignados)
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findOne({
      _id: id,
      communityId: req.communityId,
      isActive: true
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    if (role.isBaseRole) {
      return res.status(403).json({
        success: false,
        message: 'Los roles base no se pueden eliminar'
      });
    }

    // Verificar que no haya usuarios con este rol
    const usersWithRole = await User.countDocuments({
      communityId: req.communityId,
      role: role.customName || role.name,
      isActive: true
    });

    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el rol porque hay ${usersWithRole} usuario(s) asignado(s). Reasigna esos usuarios a otro rol primero.`
      });
    }

    // Soft delete del rol
    role.isActive = false;
    await role.save();

    res.json({
      success: true,
      data: {
        role,
        message: 'Rol eliminado exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener permisos del usuario actual
export const getMyPermissions = async (req, res) => {
  try {
    // El presidente tiene todos los permisos
    if (req.userRole === 'president') {
      return res.json({
        success: true,
        data: {
          role: 'president',
          permissions: 'all',
          isPresident: true
        }
      });
    }

    const role = await Role.findOne({
      communityId: req.communityId,
      name: req.userRole,
      isActive: true
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        role: role.customName || role.name,
        permissions: role.permissions,
        isBaseRole: role.isBaseRole
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Inicializar roles base para una comunidad (se llama cuando se crea la comunidad)
export const initializeBaseRoles = async (communityId) => {
  const baseRoles = [
    {
      name: 'president',
      permissions: {
        resident: { create: true, read: true, update: true, delete: true },
        dwelling: { create: true, read: true, update: true, delete: true },
        letter: { generateNormal: true, generateJuramentada: true, confirmJuramentada: true, download: true, verifyQr: true },
        dashboard: { access: true, scope: 'full' },
        user: { create: true, read: true, update: true, delete: true, changePassword: true, manageRoles: true },
        announcement: { create: true, read: true, update: true, delete: true },
        community: { read: true, update: true, delete: true },
        role: { create: true, read: true, update: true, delete: true },
        export: { residents: true, dwellings: true, letters: true, all: true }
      }
    },
    {
      name: 'secretario',
      permissions: {
        resident: { create: true, read: true, update: true, delete: false },
        dwelling: { create: true, read: true, update: true, delete: false },
        letter: { generateNormal: true, generateJuramentada: true, confirmJuramentada: true, download: true, verifyQr: true },
        dashboard: { access: true, scope: 'full' },
        user: { create: true, read: true, update: false, delete: false, changePassword: false, manageRoles: false },
        announcement: { create: true, read: true, update: false, delete: false },
        community: { read: true, update: false, delete: false },
        role: { create: false, read: true, update: false, delete: false },
        export: { residents: true, dwellings: true, letters: true, all: false }
      }
    },
    {
      name: 'tesorero',
      permissions: {
        resident: { create: true, read: true, update: true, delete: false },
        dwelling: { create: true, read: true, update: true, delete: false },
        letter: { generateNormal: true, generateJuramentada: true, confirmJuramentada: true, download: true, verifyQr: true },
        dashboard: { access: true, scope: 'full' },
        user: { create: true, read: true, update: false, delete: false, changePassword: false, manageRoles: false },
        announcement: { create: true, read: true, update: false, delete: false },
        community: { read: true, update: false, delete: false },
        role: { create: false, read: true, update: false, delete: false },
        export: { residents: true, dwellings: true, letters: true, all: false }
      }
    },
    {
      name: 'residente',
      permissions: {
        resident: { create: false, read: false, update: false, delete: false },
        dwelling: { create: false, read: false, update: false, delete: false },
        letter: { generateNormal: true, generateJuramentada: false, confirmJuramentada: false, download: true, verifyQr: true },
        dashboard: { access: true, scope: 'limited' },
        user: { create: false, read: false, update: true, delete: false, changePassword: true, manageRoles: false },
        announcement: { create: false, read: true, update: false, delete: false },
        community: { read: true, update: false, delete: false },
        role: { create: false, read: false, update: false, delete: false },
        export: { residents: false, dwellings: false, letters: false, all: false }
      }
    },
    {
      name: 'censista',
      permissions: {
        resident: { create: true, read: true, update: false, delete: false },
        dwelling: { create: true, read: true, update: false, delete: false },
        letter: { generateNormal: false, generateJuramentada: false, confirmJuramentada: false, download: false, verifyQr: true },
        dashboard: { access: true, scope: 'limited' },
        user: { create: false, read: false, update: false, delete: false, changePassword: true, manageRoles: false },
        announcement: { create: false, read: true, update: false, delete: false },
        community: { read: true, update: false, delete: false },
        role: { create: false, read: false, update: false, delete: false },
        export: { residents: false, dwellings: false, letters: false, all: false }
      }
    }
  ];

  const createdRoles = [];
  for (const baseRole of baseRoles) {
    const role = await Role.findOneAndUpdate(
      { communityId, name: baseRole.name },
      {
        communityId,
        name: baseRole.name,
        isBaseRole: true,
        permissions: baseRole.permissions,
        isActive: true
      },
      { upsert: true, new: true }
    );
    createdRoles.push(role);
  }

  return createdRoles;
};
