import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BranchesModule } from './branches/branches.module';
import { RolesModule } from './roles/roles.module';
import { DepartmentsModule } from './departments/departments.module';
import { StorageModule } from './storage/storage.module';
import { StorageController } from './storage/storage.controller';
import { StorageService } from './storage/storage.service';
import { AssetsModule } from './assets/assets.module';
import { PeopleModule } from './people/people.module';
import { AuthModule } from './auth/auth.module';



@Module({
  imports: [PrismaModule, BranchesModule, RolesModule, DepartmentsModule, StorageModule, AssetsModule, PeopleModule, AuthModule],
  controllers: [AppController, StorageController],
  providers: [AppService, StorageService],
})
export class AppModule {}
