import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsUserController } from './assets-user.controller';
import { AssetsService } from './assets.service';

@Module({
    controllers: [AssetsController, AssetsUserController],
    providers: [AssetsService],
})
export class AssetsModule {}

