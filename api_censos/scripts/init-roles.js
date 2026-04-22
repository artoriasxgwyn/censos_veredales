import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/role.model.js';

dotenv.config();

const COMMUNITY_ID = process.argv[2];

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

async function initRoles() {
  if (!COMMUNITY_ID) {
    console.error('❌ Uso: node scripts/init-roles.js <communityId>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    // Verificar que la comunidad existe
    const Community = (await import('../models/community.model.js')).default;
    const community = await Community.findById(COMMUNITY_ID);
    if (!community) {
      console.error(`❌ Comunidad no encontrada: ${COMMUNITY_ID}`);
      process.exit(1);
    }
    console.log(`📍 Comunidad: ${community.neighborhood} (${community.city})`);

    // Crear/actualizar roles
    for (const baseRole of baseRoles) {
      const role = await Role.findOneAndUpdate(
        { communityId: COMMUNITY_ID, name: baseRole.name },
        {
          communityId: COMMUNITY_ID,
          name: baseRole.name,
          isBaseRole: true,
          permissions: baseRole.permissions,
          isActive: true
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Rol "${baseRole.name}" creado/actualizado`);
    }

    console.log('\n✨ Roles inicializados correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initRoles();
