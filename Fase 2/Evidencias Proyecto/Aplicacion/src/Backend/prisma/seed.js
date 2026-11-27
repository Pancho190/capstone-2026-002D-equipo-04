const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@duoc.cl';
  const existing = await prisma.usuarioAdmision.findUnique({ where: { correo: adminEmail } });

  if (existing) {
    console.log('Admin ya existe:', adminEmail);
    return;
  }

  const hashed = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.usuarioAdmision.create({
    data: {
      correo: adminEmail,
      password_hash: hashed,
      nombre_completo: 'Administrador',
      rol: 'ADMIN',
      rut: '11.111.111-1'
    }
  });
  console.log('Admin creado:', admin.correo);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
