import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/role.model.js';

dotenv.config();

async function fixRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    // Actualizar secretario
    const secretarioUpdated = await Role.updateMany(
      { name: 'secretario', isActive: true },
      {
        $set: {
          'permissions.resident.update': true,
          'permissions.dwelling.update': true,
          'permissions.user.create': true,
          'permissions.user.read': true,
          'permissions.user.update': false,
          'permissions.user.delete': false,
          'permissions.community.read': true,
          'permissions.community.update': false,
          'permissions.community.delete': false,
          'permissions.role.create': false,
          'permissions.role.read': true,
          'permissions.role.update': false,
          'permissions.role.delete': false,
          'permissions.export.residents': true,
          'permissions.export.dwellings': true,
          'permissions.export.letters': true,
          'permissions.export.all': false,
          'permissions.letter.confirmJuramentada': true,
          'permissions.letter.download': true
        }
      }
    );
    console.log(`✅ Secretario actualizado: ${secretarioUpdated.modifiedCount} documentos`);

    // Actualizar tesorero
    const tesoreroUpdated = await Role.updateMany(
      { name: 'tesorero', isActive: true },
      {
        $set: {
          'permissions.resident.update': true,
          'permissions.dwelling.update': true,
          'permissions.user.create': true,
          'permissions.user.read': true,
          'permissions.user.update': false,
          'permissions.user.delete': false,
          'permissions.community.read': true,
          'permissions.community.update': false,
          'permissions.community.delete': false,
          'permissions.role.create': false,
          'permissions.role.read': true,
          'permissions.role.update': false,
          'permissions.role.delete': false,
          'permissions.export.residents': true,
          'permissions.export.dwellings': true,
          'permissions.export.letters': true,
          'permissions.export.all': false,
          'permissions.letter.confirmJuramentada': true,
          'permissions.letter.download': true
        }
      }
    );
    console.log(`✅ Tesorero actualizado: ${tesoreroUpdated.modifiedCount} documentos`);

    // Actualizar censista
    const censistaUpdated = await Role.updateMany(
      { name: 'censista', isActive: true },
      {
        $set: {
          'permissions.user.read': false,
          'permissions.community.read': true,
          'permissions.community.update': false,
          'permissions.community.delete': false,
          'permissions.role.read': false,
          'permissions.export.residents': false,
          'permissions.export.dwellings': false,
          'permissions.export.letters': false,
          'permissions.export.all': false,
          'permissions.letter.confirmJuramentada': false,
          'permissions.letter.download': false
        }
      }
    );
    console.log(`✅ Censista actualizado: ${censistaUpdated.modifiedCount} documentos`);

    // Actualizar residente
    const residenteUpdated = await Role.updateMany(
      { name: 'residente', isActive: true },
      {
        $set: {
          'permissions.user.read': false,
          'permissions.user.update': true,
          'permissions.community.read': true,
          'permissions.community.update': false,
          'permissions.community.delete': false,
          'permissions.role.read': false,
          'permissions.export.residents': false,
          'permissions.export.dwellings': false,
          'permissions.export.letters': false,
          'permissions.export.all': false,
          'permissions.letter.confirmJuramentada': false,
          'permissions.letter.download': true
        }
      }
    );
    console.log(`✅ Residente actualizado: ${residenteUpdated.modifiedCount} documentos`);

    console.log('\n✨ Todos los roles han sido actualizados con la estructura completa de permisos');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixRoles();
