import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createInitialAdmin() {
  try {
    // ⚠️ IMPORTANTE: Configurar estas variables de entorno antes de ejecutar
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        '❌ Variables de entorno faltantes:\n' +
        'Debes configurar ADMIN_EMAIL y ADMIN_PASSWORD en tu archivo .env\n\n' +
        'Ejemplo:\n' +
        'ADMIN_EMAIL=admin@tuempresa.com\n' +
        'ADMIN_PASSWORD=TuContraseñaSegura123!\n'
      );
    }

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { correo: adminEmail },
    });

    if (existingAdmin) {
      console.log('✅ Ya existe un administrador con ese correo');
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Crear el admin
    const admin = await prisma.admin.create({
      data: {
        nombre: 'Administrador Principal',
        correo: adminEmail,
        contrasenaHash: hashedPassword,
        estado: true,
      },
    });

    console.log('✅ Administrador creado exitosamente');
    console.log('📧 Email:', admin.correo);
    console.log('🆔 ID:', admin.id);
    console.log('\n⚠️ IMPORTANTE: Guarda estas credenciales de forma segura');
    
  } catch (error) {
    console.error('❌ Error al crear el administrador:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createInitialAdmin()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
