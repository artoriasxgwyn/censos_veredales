import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/role.model.js';

dotenv.config();

async function checkPermissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    const secretario = await Role.findOne({ name: 'secretario', isActive: true });

    if (!secretario) {
      console.log('❌ No se encontró el rol de secretario');
      process.exit(1);
    }

    console.log('\n📋 Permisos del secretario:\n');

    console.log('role:', {
      create: secretario.permissions.role?.create,
      read: secretario.permissions.role?.read,
      update: secretario.permissions.role?.update,
      delete: secretario.permissions.role?.delete
    });

    console.log('\nuser:', {
      create: secretario.permissions.user?.create,
      read: secretario.permissions.user?.read,
      update: secretario.permissions.user?.update,
      delete: secretario.permissions.user?.delete,
      manageRoles: secretario.permissions.user?.manageRoles
    });

    console.log('\nletter:', {
      generateNormal: secretario.permissions.letter?.generateNormal,
      generateJuramentada: secretario.permissions.letter?.generateJuramentada,
      confirmJuramentada: secretario.permissions.letter?.confirmJuramentada,
      download: secretario.permissions.letter?.download,
      verifyQr: secretario.permissions.letter?.verifyQr
    });

    console.log('\nexport:', {
      residents: secretario.permissions.export?.residents,
      dwellings: secretario.permissions.export?.dwellings,
      letters: secretario.permissions.export?.letters,
      all: secretario.permissions.export?.all
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkPermissions();
