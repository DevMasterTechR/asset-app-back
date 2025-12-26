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
    const personId = Number(req.user.personId ?? req.user.sub);
    return await this.assetsService.findByAssignedPersonId(personId);
  }

  @Get('types')
  @ApiOperation({ summary: 'Obtener tipos de activos disponibles' })
  async getAssetTypes() {
    return this.assetsService.findUniqueAssetTypes();
  }
}
