const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const migrations = await prisma.$queryRawUnsafe(
      'SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 20',
    );
    console.log('MIGRATIONS');
    console.log(JSON.stringify(migrations, null, 2));

    const columns = await prisma.$queryRawUnsafe(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'AssignmentHistory' ORDER BY column_name",
    );
    console.log('ASSIGNMENT_HISTORY_COLUMNS');
    console.log(JSON.stringify(columns, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
