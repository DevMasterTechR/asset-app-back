import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BranchesModule } from './branches/branches.module';
import { RolesModule } from './roles/roles.module';
import { DepartmentsModule } from './departments/departments.module';
import { StorageModule } from './storage/storage.module';
import { AssetsModule } from './assets/assets.module';
import { PeopleModule } from './people/people.module';
import { AuthModule } from './auth/auth.module';
import { InkModule } from './ink/ink.module';

import { UtpCableModule } from './utp-cable/utp-cable.module';

import { Rj45ConnectorModule } from './rj45-connector/rj45-connector.module';
import { PowerStripModule } from './power-strip/power-strip.module';
import { AssignmentHistoryModule } from './assignment-history/assignment-history.module';
import { CredentialsModule } from './credentials/credentials.module';
import { SimCardsModule } from './sim-cards/sim-cards.module';

@Module({
    imports: [
        PrismaModule,
        BranchesModule,
        RolesModule,
        DepartmentsModule,
        StorageModule,
        AssetsModule,
        PeopleModule,
        AuthModule,
        InkModule,
        UtpCableModule,
        Rj45ConnectorModule,
        PowerStripModule,
        AssignmentHistoryModule,
        CredentialsModule,
        SimCardsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
