import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { IntegrationApiKeyGuard } from 'src/common/guards/integration-api-key.guard';
import { AssetsService } from '../assets.service';
import { SyncHwidAssetDto } from '../dto/sync-hwid-asset.dto';

// Endpoint de solo escritura para HWIDApp/hwid-server (vía integration key,
// no sesión de usuario): crea o actualiza el activo que corresponde a un
// equipo ya registrado en HWIDApp, usando su código como el verdadero.
@ApiExcludeController()
@UseGuards(IntegrationApiKeyGuard)
@Controller('integrations/assets')
export class IntegrationAssetsController {
    constructor(private readonly assetsService: AssetsService) {}

    @Post('sync-hwid')
    syncHwid(@Body() dto: SyncHwidAssetDto) {
        return this.assetsService.sincronizarDesdeHwid(dto);
    }
}
