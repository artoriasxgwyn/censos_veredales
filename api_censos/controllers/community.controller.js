import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Community from '../models/community.model.js';
import User from '../models/user.model.js';
import Role from '../models/role.model.js';

// Inicializar roles base para una comunidad
const initializeBaseRoles = async (communityId) => {
  const baseRoles = [
    {
      name: 'president',
      permissions: {
        resident: { create: true, read: true, update: true, delete: true },
        dwelling: { create: true, read: true, update: true, delete: true },
        letter: { generateNormal: true, generateSworn: true, qrScan: true },
        dashboard: { access: true, scope: 'full' },
        user: { changePassword: true, manageRoles: true },
        announcement: { create: true, read: true, update: true, delete: true }
      }
    },
    {
      name: 'secretario',
      permissions: {
        resident: { create: true, read: true, update: true, delete: false },
        dwelling: { create: true, read: true, update: true, delete: false },
        letter: { generateNormal: true, generateSworn: true, qrScan: true },
        dashboard: { access: true, scope: 'full' },
        user: { changePassword: false, manageRoles: false },
        announcement: { create: true, read: true, update: true, delete: false }
      }
    },
    {
      name: 'tesorero',
      permissions: {
        resident: { create: true, read: true, update: true, delete: false },
        dwelling: { create: true, read: true, update: true, delete: false },
        letter: { generateNormal: true, generateSworn: true, qrScan: true },
        dashboard: { access: true, scope: 'full' },
        user: { changePassword: false, manageRoles: false },
        announcement: { create: true, read: true, update: true, delete: false }
      }
    },
    {
      name: 'residente',
      permissions: {
        resident: { create: false, read: false, update: false, delete: false },
        dwelling: { create: false, read: false, update: false, delete: false },
        letter: { generateNormal: true, generateSworn: false, qrScan: true },
        dashboard: { access: true, scope: 'limited' },
        user: { changePassword: true, manageRoles: false },
        announcement: { create: false, read: true, update: false, delete: false }
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

export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ isActive: true });
    res.json({ success: true, data: communities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findOne({ _id: req.params.id, isActive: true });
    if (!community) {
      return res.status(404).json({ success: false, message: 'Comunidad no encontrada' });
    }
    res.json({ success: true, data: community });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCommunityByCode = async (req, res) => {
  try {
    const community = await Community.findOne({ code: req.params.code, isActive: true });
    if (!community) {
      return res.status(404).json({ success: false, message: 'Comunidad no encontrada' });
    }
    res.json({ success: true, data: community });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCommunity = async (req, res) => {
  try {
    const { president, ...communityData } = req.validatedBody;

    // Generar código de 6 dígitos único
    let code;
    let exists = true;
    while (exists) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await Community.findOne({ code });
      exists = !!existing;
    }

    // Crear comunidad
    const community = await Community.create({
      ...communityData,
      code
    });

    // Crear usuario presidente
    const hashedPassword = await bcrypt.hash(president.password, 10);
    const presidentUser = await User.create({
      fullName: president.fullName,
      documentNumber: president.documentNumber,
      birthDate: president.birthDate,
      phone: president.phone,
      email: president.email,
      signature: president.signature,
      password: hashedPassword,
      role: 'president',
      communityId: community._id
    });

    // Actualizar comunidad con el ID del presidente
    community.presidentId = presidentUser._id;
    await community.save();

    // Inicializar roles base para esta comunidad
    await initializeBaseRoles(community._id);

    res.status(201).json({
      success: true,
      data: {
        community: {
          _id: community._id,
          code: community.code,
          neighborhood: community.neighborhood,
          city: community.city
        },
        president: {
          _id: presidentUser._id,
          fullName: presidentUser.fullName,
          email: presidentUser.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      req.validatedBody,
      { new: true, runValidators: true }
    );
    if (!community) {
      return res.status(404).json({ success: false, message: 'Comunidad no encontrada' });
    }
    res.json({ success: true, data: community });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!community) {
      return res.status(404).json({ success: false, message: 'Comunidad no encontrada' });
    }
    res.json({ success: true, message: 'Comunidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
