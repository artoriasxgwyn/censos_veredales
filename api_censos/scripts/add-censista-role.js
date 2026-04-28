import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/role.model.js';
import Community from '../models/community.model.js';

dotenv.config();

const censistaRole = {
  name: 'censista',
  permissions: {
    resident: { create: true, read: true, update: false, delete: false },
    dwelling: { create: false, read: true, update: false, delete: false },
    letter: { generateNormal: false, generateSworn: false, qrScan: true },
    dashboard: { access: true, scope: 'limited' },
    user: { changePassword: true, manageRoles: false },
    announcement: { create: false, read: true, update: false, delete: false }
  }
};

async function addCensistaRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    const communities = await Community.find({ isActive: true });
    console.log(`📍 ${communities.length} comunidades activas encontradas`);

    let updated = 0;
    let alreadyExists = 0;

    for (const community of communities) {
      const existingRole = await Role.findOne({
        communityId: community._id,
        name: 'censista'
      });

      if (existingRole) {
        console.log(`⏭️  Comunidad "${community.neighborhood}" ya tiene rol censista`);
        alreadyExists++;
        continue;
      }

      await Role.create({
        communityId: community._id,
        name: 'censista',
        isBaseRole: true,
        permissions: censistaRole.permissions,
        isActive: true
      });

      console.log(`✅ Rol "censista" agregado a "${community.neighborhood}"`);
      updated++;
    }

    console.log(`\n✨ Resumen: ${updated} actualizadas, ${alreadyExists} ya tenían el rol`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addCensistaRole();
