import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    constructor() {
  super();
    // PrismaService initialized silently.
}
  async onModuleInit() {
    try {
      await this.$connect();
      // Connected to DB (silent)
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:');
      console.error(error);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    // Closing DB connection
    await this.$disconnect();
    // DB connection closed
  }
}
