import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    constructor() {
  super();
  console.log('🟢 Nueva instancia de PrismaService creada');
  console.trace(); 
}
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Conectado a la base de datos correctamente.');
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:');
      console.error(error);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    console.log('👋 Cerrando conexión a la base de datos...');
    await this.$disconnect();
    console.log('✅ Conexión cerrada.');
  }
}
