import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AssetsService } from './assets.service';

@ApiTags('Assets - User endpoints')
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsUserController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('user/assigned')
  @ApiOperation({ summary: 'Obtener equipos asignados al usuario' })
  async getUserAssets(@Request() req) {
    console.log('\n========== GET /assets/user/assigned ==========');
    console.log('[AssetsUserController] User JWT payload:', JSON.stringify(req.user, null, 2));
    const personId = Number(req.user.personId ?? req.user.sub);
    console.log('[AssetsUserController] PersonId extraído:', personId);
    
    const assets = await this.assetsService.findByAssignedPersonId(personId);
    
    console.log('[AssetsUserController] Assets a retornar:', JSON.stringify(assets, null, 2));
    console.log('========== FIN GET /assets/user/assigned ==========\n');
    return assets;
  }

  @Get('types')
  @ApiOperation({ summary: 'Obtener tipos de activos disponibles' })
  async getAssetTypes() {
    return this.assetsService.findUniqueAssetTypes();
  }
}
