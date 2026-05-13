import { PrismaClient } from '@prisma/client';
import { AssignmentHistoryService } from '../src/assignment-history/assignment-history.service';
import { PrismaService } from '../src/prisma/prisma.service';

// Esta prueba solo se ejecuta si se configura DATABASE_URL_TEST en el entorno.
const testDbUrl = process.env.DATABASE_URL_TEST;

if (!testDbUrl) {
  console.warn('Skipping assignment-delete e2e test: set DATABASE_URL_TEST to run it.');
  describe.skip('assignment-delete (skipped no test DB)', () => {});
} else {
  describe('Assignment delete e2e', () => {
    const prisma = new PrismaClient({ datasources: { db: { url: testDbUrl } } });
    const prismaService = new PrismaService();
    // Replace internal client connection of prismaService with our test client
    // @ts-ignore
    prismaService.$connect = () => prisma.$connect();
    // @ts-ignore
    prismaService.$disconnect = () => prisma.$disconnect();
    // @ts-ignore
    prismaService.$transaction = prisma.$transaction.bind(prisma);

    const svc = new AssignmentHistoryService(prismaService as any);

    beforeAll(async () => {
      await prisma.$connect();
      // Limpiar tablas relevantes
      await prisma.assignmentHistory.deleteMany();
      await prisma.asset.deleteMany();
      await prisma.person.deleteMany();
      await prisma.branch.deleteMany();
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    test('deleting main assignment also removes auto perif assignments and frees assets', async () => {
      // Crear branch y person
      const branch = await prisma.branch.create({ data: { name: 'Test', address: 'x', region: 'x' } });
      const person = await prisma.person.create({ data: { nationalId: 'T1', firstName: 'Test', lastName: 'User' } });

      // Crear activos: main, charger, cable
      const main = await prisma.asset.create({ data: { assetCode: 'MAIN-1', assetType: 'celular', status: 'assigned' } });
      const charger = await prisma.asset.create({ data: { assetCode: 'CHG-1', assetType: 'cargador-celular', status: 'assigned' } });
      const cable = await prisma.asset.create({ data: { assetCode: 'CABL-1', assetType: 'cable-carga', status: 'assigned' } });

      // Crear historial principal
      const assignmentDate = new Date();
      const mainHist = await prisma.assignmentHistory.create({ data: { assetId: main.id, personId: person.id, branchId: branch.id, assignmentDate, deliveryNotes: 'Asignación manual' } });

      // Crear historiales automáticos (simulan los periféricos creados por el frontend)
      const chargerHist = await prisma.assignmentHistory.create({ data: { assetId: charger.id, personId: person.id, branchId: branch.id, assignmentDate, deliveryNotes: 'Asignación automática junto con celular/tablet' } });
      const cableHist = await prisma.assignmentHistory.create({ data: { assetId: cable.id, personId: person.id, branchId: branch.id, assignmentDate, deliveryNotes: 'Asignación automática junto con celular/tablet' } });

      // Verificar precondición
      const beforeMain = await prisma.assignmentHistory.findUnique({ where: { id: mainHist.id } });
      expect(beforeMain).not.toBeNull();
      const beforeCharger = await prisma.assignmentHistory.findUnique({ where: { id: chargerHist.id } });
      expect(beforeCharger).not.toBeNull();

      // Ejecutar remove (nuestro servicio)
      const res = await svc.remove(mainHist.id);
      expect(res).toBeDefined();

      // Comprobar que los historiales de periféricos ya no existen
      const afterCharger = await prisma.assignmentHistory.findUnique({ where: { id: chargerHist.id } });
      const afterCable = await prisma.assignmentHistory.findUnique({ where: { id: cableHist.id } });
      expect(afterCharger).toBeNull();
      expect(afterCable).toBeNull();

      // Comprobar que los assets quedaron disponibles
      const mainAsset = await prisma.asset.findUnique({ where: { id: main.id } });
      const chargerAsset = await prisma.asset.findUnique({ where: { id: charger.id } });
      const cableAsset = await prisma.asset.findUnique({ where: { id: cable.id } });
      expect(mainAsset?.status).toBe('available');
      expect(chargerAsset?.status).toBe('available');
      expect(cableAsset?.status).toBe('available');
    }, 20000);
  });
}
