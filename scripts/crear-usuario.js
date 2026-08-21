/**
 * Crea un usuario o repone su contraseña.
 *
 *   docker compose exec api node scripts/crear-usuario.js <usuario> <contraseña> [--rol=NOMBRE]
 *
 * Si el usuario ya existe, solo actualiza la contraseña (y lo reactiva si
 * estaba inactivo). Si no existe, lo crea con el rol indicado.
 * Usa el mismo bcrypt de 10 rondas que auth.service.ts, así que la contraseña
 * queda válida para el login normal.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const usuario = args[0];
  const contrasena = args[1];
  const rolPedido = (args.find((a) => a.startsWith('--rol=')) || '').replace('--rol=', '');
  const cedula = (args.find((a) => a.startsWith('--cedula=')) || '').replace('--cedula=', '');

  if (!usuario || !contrasena) {
    console.error('Uso: node scripts/crear-usuario.js <usuario> <contraseña> [--rol=NOMBRE] [--cedula=NUM]');
    process.exit(1);
  }
  if (contrasena.length < 6) {
    console.error('✗ La contraseña debe tener al menos 6 caracteres.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(contrasena, 10);
  const existente = await prisma.person.findUnique({
    where: { username: usuario },
    include: { role: true },
  });

  if (existente) {
    await prisma.person.update({
      where: { id: existente.id },
      data: {
        password: hash,
        status: 'active',
        mustChangePassword: false,
        // Invalida cualquier sesión anterior de este usuario.
        currentToken: null,
      },
    });
    console.log(`✓ Contraseña actualizada para "${usuario}" (id ${existente.id})`);
    console.log(`  Nombre: ${existente.firstName} ${existente.lastName}`);
    console.log(`  Rol:    ${existente.role ? existente.role.name : 'SIN ROL — el front puede no mostrar los menús'}`);
    if (existente.status !== 'active') console.log(`  Estado: reactivado (estaba "${existente.status}")`);
    return;
  }

  // No existe: hay que crearlo, y para eso necesita rol.
  const roles = await prisma.role.findMany({ orderBy: { id: 'asc' } });
  let rol = null;
  if (rolPedido) {
    rol = roles.find((r) => r.name.toLowerCase() === rolPedido.toLowerCase());
    if (!rol) {
      console.error(`✗ No existe el rol "${rolPedido}". Roles disponibles: ${roles.map((r) => r.name).join(', ')}`);
      process.exit(1);
    }
  } else {
    rol = roles.find((r) => /admin/i.test(r.name)) || roles[0];
    if (!rol) {
      console.error('✗ No hay ningún rol en la base de datos. Crea uno antes de continuar.');
      process.exit(1);
    }
    console.log(`▸ Sin --rol: se usa "${rol.name}". Disponibles: ${roles.map((r) => r.name).join(', ')}`);
  }

  const creado = await prisma.person.create({
    data: {
      // nationalId es único y obligatorio; si no se pasa se marca como generado
      // para que se distinga de una cédula real.
      nationalId: cedula || `AUTO-${usuario}`,
      firstName: usuario,
      lastName: '(usuario creado por script)',
      username: usuario,
      password: hash,
      status: 'active',
      roleId: rol.id,
      mustChangePassword: false,
    },
  });

  console.log(`✓ Usuario "${usuario}" creado (id ${creado.id}, rol ${rol.name})`);
  console.log(`  nationalId: ${creado.nationalId}`);
  console.log('  Edita nombre, apellido y cédula desde la app cuando entres.');
}

main()
  .catch((e) => {
    if (e.code === 'P2002') {
      console.error(`✗ Conflicto de campo único: ${JSON.stringify(e.meta && e.meta.target)}`);
      console.error('  Si es nationalId, vuelve a ejecutar con --cedula=<un número distinto>.');
    } else {
      console.error('✗', e.message);
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
