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
import { MouseModule } from './mouse/mouse.module';
import { KeyboardModule } from './keyboard/keyboard.module';
import { MousePadModule } from './mouse-pad/mouse-pad.module';
import { MemoryAdapterModule } from './memory-adapter/memory-adapter.module';

import { UtpCableModule } from './utp-cable/utp-cable.module';

import { Rj45ConnectorModule } from './rj45-connector/rj45-connector.module';
import { PowerStripModule } from './power-strip/power-strip.module';
import { AssignmentHistoryModule } from './assignment-history/assignment-history.module';
import { LoansModule } from './loans/loans.module';
import { CredentialsModule } from './credentials/credentials.module';
import { SimCardsModule } from './sim-cards/sim-cards.module';
import { RequestsModule } from './requests/requests.module';
import { HubModule } from './hub/hub.module';
import { SupportModule } from './support/support.module';
import { NetworkAdapterModule } from './network-adapter/network-adapter.module';

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
        MouseModule,
        KeyboardModule,
        MousePadModule,
        MemoryAdapterModule,
        UtpCableModule,
        Rj45ConnectorModule,
        PowerStripModule,
        AssignmentHistoryModule,
        LoansModule,
        CredentialsModule,
        SimCardsModule,
        RequestsModule,
        HubModule,
        SupportModule,
        NetworkAdapterModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
