import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const adminEmail = 'admin@magnolias.com';
  const adminPassword = 'Admin123!';
  const adminNombre = 'Administrador del Sistema';

  // Verificar si ya existe
  const existingAdmin = await prisma.admin.findUnique({
    where: { correo: adminEmail },
  });

  if (existingAdmin) {
    console.log('❌ El administrador ya existe:', adminEmail);
    return;
  }

  // Hash de la contraseña
  const contrasenaHash = await bcrypt.hash(adminPassword, 10);

  // Crear admin
  const admin = await prisma.admin.create({
    data: {
      nombre: adminNombre,
      correo: adminEmail,
      contrasenaHash,
      estado: true,
    },
  });

  console.log('✅ Administrador creado exitosamente:');
  console.log('   Correo:', adminEmail);
  console.log('   Contraseña:', adminPassword);
  console.log('   ID:', admin.id);
  console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
}

createAdmin()
  .catch((e) => {
    console.error('Error al crear administrador:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
