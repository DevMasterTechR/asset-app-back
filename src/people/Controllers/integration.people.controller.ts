import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { IntegrationApiKeyGuard } from 'src/common/guards/integration-api-key.guard';
import { PeopleService } from '../people.service';

// Endpoint de solo lectura para sistemas externos (hoy: HWIDApp), protegido
// por API key propia (ver IntegrationApiKeyGuard), no por sesión de usuario.
@ApiExcludeController()
@UseGuards(IntegrationApiKeyGuard)
@Controller('integrations/people')
export class IntegrationPeopleController {
    constructor(private readonly peopleService: PeopleService) {}

    @Get('by-cedula/:cedula')
    byCedula(@Param('cedula') cedula: string) {
        return this.peopleService.findByCedulaConFallback(cedula);
    }
}
