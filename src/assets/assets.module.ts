import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsUserController } from './assets-user.controller';
import { IntegrationAssetsController } from './Controllers/integration.assets.controller';
import { AssetsService } from './assets.service';
import { PeopleModule } from '../people/people.module';

@Module({
    imports: [PeopleModule],
    controllers: [AssetsController, AssetsUserController, IntegrationAssetsController],
    providers: [AssetsService],
})
export class AssetsModule {}

