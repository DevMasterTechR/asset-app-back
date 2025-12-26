import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService, PrismaService, EmailService],
  exports: [RequestsService],
})
export class RequestsModule {}
