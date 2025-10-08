import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Mensaje de bienvenida' })
  @ApiResponse({ status: 200, description: 'Mensaje recibido correctamente', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
