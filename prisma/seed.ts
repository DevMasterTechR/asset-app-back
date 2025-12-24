import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // Limpiar datos existentes (opcional, para reset completo)
  // await prisma.request.deleteMany({});
  // await prisma.credential.deleteMany({});
  // await prisma.assignmentHistory.deleteMany({});
  // await prisma.simCard.deleteMany({});
  // await prisma.storageCapacity.deleteMany({});
  // await prisma.asset.deleteMany({});
  // await prisma.person.deleteMany({});
  // await prisma.role.deleteMany({});
  // await prisma.department.deleteMany({});
  // await prisma.branch.deleteMany({});

  // 1. Crear Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'Administrador del sistema' },
  });

  const usuarioRole = await prisma.role.upsert({
    where: { name: 'Usuario' },
    update: {},
    create: { name: 'Usuario', description: 'Usuario estándar' },
  });

  const rrhhRole = await prisma.role.upsert({
    where: { name: 'Recursos Humanos' },
    update: {},
    create: { name: 'Recursos Humanos', description: 'Recursos Humanos' },
  });

  console.log('✅ Roles creados');

  // 2. Crear Departamentos
  const itDept = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'T.I.', description: 'Departamento de Tecnología' },
  });

  const rrhhDept = await prisma.department.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Recursos Humanos', description: 'Departamento de Recursos Humanos' },
  });

  const importDept = await prisma.department.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Importaciones', description: 'Departamento de Importaciones' },
  });

  console.log('✅ Departamentos creados');

  // 3. Crear Sucursales
  const branches = [
    { name: 'Matriz Quito', address: 'Isla Fernandina N42-129 y Tomás de Berlanga, Quito', region: 'Sierra' },
    { name: 'Quito Sur (Express)', address: 'Sector Solanda, Av. Ajaví OE-3179 y Pedro Vásquez, Quito', region: 'Sierra' },
    { name: 'Carapungo (Express)', address: 'Edificio Gualoto, Panamericana Norte, Quito', region: 'Sierra' },
    { name: 'Sangolquí (Express)', address: 'Av. Panamericana y Atuntaqui, Sangolquí', region: 'Sierra' },
    { name: 'Ambato', address: 'Av. Los Shyris y Quinga Lumba 1788, a 50m de CNT, Ambato', region: 'Sierra' },
    { name: 'Ibarra', address: 'Luis Jaramillo Pérez 206 y Alfonso Almeida, Ibarra', region: 'Sierra' },
    { name: 'Cuenca', address: 'Av. 12 de Abril entre San Salvador y Floreana, Cuenca', region: 'Sierra' },
    { name: 'Loja', address: 'Av. Manuel Benjamín Carrión y Antonio Neumane, Loja', region: 'Sierra' },
    { name: 'Guayaquil', address: 'Av. Víctor Emilio Estrada 814, entre Higuera – Guayacanes, Guayaquil', region: 'Costa' },
    { name: 'Manta', address: 'Av. Ascario Paz y Av. Flavio Reyes, diagonal al Restaurante Palmeiras, Manta', region: 'Costa' },
    { name: 'Portoviejo (Express)', address: 'Plaza Alameda, Av. Manabí frente al C.C. La Quadra, Portoviejo', region: 'Costa' },
    { name: 'Machala', address: 'Av. 11ª Norte entre Buenavista y Napoleón Mera, Machala', region: 'Costa' },
    { name: 'Santo Domingo', address: 'Calle Guayaquil, entre Calle Cocaniguas y Santo Domingo', region: 'Costa' },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { id: branches.indexOf(branch) + 1 },
      update: branch,
      create: branch,
    });
  }

  console.log('✅ Sucursales creadas');

  // 4. Crear Personas (Admin, Usuario, RRHH)
  const adminPerson = await prisma.person.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nationalId: '1234567890',
      firstName: 'Admin',
      lastName: 'Sistema',
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      status: 'active',
      roleId: adminRole.id,
      departmentId: itDept.id,
      branchId: 1,
    },
  });

  const rrhhPerson = await prisma.person.upsert({
    where: { username: 'rrhh' },
    update: {},
    create: {
      nationalId: '0987654321',
      firstName: 'Recursos',
      lastName: 'Humanos',
      username: 'rrhh',
      password: await bcrypt.hash('rrhh123', 10),
      status: 'active',
      roleId: rrhhRole.id,
      departmentId: rrhhDept.id,
      branchId: 1,
    },
  });

  const userPerson = await prisma.person.upsert({
    where: { username: 'usuario' },
    update: {},
    create: {
      nationalId: '1122334455',
      firstName: 'Juan',
      lastName: 'Pérez',
      username: 'usuario',
      password: await bcrypt.hash('usuario123', 10),
      status: 'active',
      roleId: usuarioRole.id,
      departmentId: itDept.id,
      branchId: 1,
    },
  });

  console.log('✅ Personas creadas');

  // 5. Crear Activos (Equipos)
  const assetsData = [
    { assetCode: 'LAPTOP-001', assetType: 'Laptop', brand: 'Dell', model: 'XPS 15', serialNumber: 'SN001', status: 'assigned' as const, assignedPersonId: userPerson.id, branchId: 1, purchaseDate: new Date('2023-01-15') },
    { assetCode: 'LAPTOP-002', assetType: 'Laptop', brand: 'HP', model: 'ProBook 450', serialNumber: 'SN002', status: 'available' as const, branchId: 1, purchaseDate: new Date('2023-02-20') },
    { assetCode: 'MONITOR-001', assetType: 'Monitor', brand: 'LG', model: '27UK850', serialNumber: 'SN003', status: 'available' as const, branchId: 1, purchaseDate: new Date('2023-03-10') },
    { assetCode: 'PHONE-001', assetType: 'Teléfono', brand: 'Samsung', model: 'Galaxy S20', serialNumber: 'SN004', status: 'assigned' as const, assignedPersonId: rrhhPerson.id, branchId: 1, purchaseDate: new Date('2023-04-05') },
    { assetCode: 'KEYBOARD-001', assetType: 'Teclado', brand: 'Logitech', model: 'MX Keys', serialNumber: 'SN005', status: 'available' as const, branchId: 1, purchaseDate: new Date('2023-05-12') },
  ];

  for (const asset of assetsData) {
    await prisma.asset.upsert({
      where: { assetCode: asset.assetCode },
      update: { status: asset.status },
      create: asset,
    });
  }

  console.log('✅ Activos creados');

  // 6. Crear Historial de Asignaciones
  const asset1 = await prisma.asset.findUnique({ where: { assetCode: 'LAPTOP-001' } });
  if (asset1) {
    await prisma.assignmentHistory.upsert({
      where: { id: 1 },
      update: {},
      create: {
        assetId: asset1.id,
        personId: userPerson.id,
        branchId: 1,
        assignmentDate: new Date('2023-01-15'),
        deliveryCondition: 'good',
        deliveryNotes: 'Equipo entregado en perfecto estado',
      },
    });
  }

  console.log('✅ Historial de asignaciones creado');

  // 7. Crear Credenciales
  await prisma.credential.upsert({
    where: { id: 1 },
    update: {},
    create: {
      personId: adminPerson.id,
      username: 'admin',
      password: 'admin123',
      system: 'erp',
      notes: 'Credenciales de administrador para ERP',
    },
  });

  console.log('✅ Credenciales creadas');

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
