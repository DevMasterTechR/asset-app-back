import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { Rj45ConnectorService } from './rj45-connector.service';
import { CreateRj45ConnectorDto } from './dto/create-rj45-connector.dto';
import { UpdateRj45ConnectorDto } from './dto/update-rj45-connector.dto';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, SessionGuard)
@ApiTags('RJ45 Connectors') // Swagger: agrupa el controlador
@Controller('rj45-connectors')
export class Rj45ConnectorController {
  constructor(private readonly service: Rj45ConnectorService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo conector RJ45' })
  @ApiResponse({ status: 201, description: 'Conector creado correctamente' })
  create(@Body() createDto: CreateRj45ConnectorDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los conectores RJ45' })
  @ApiResponse({ status: 200, description: 'Lista de conectores' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un conector RJ45 por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del conector' })
  @ApiResponse({ status: 200, description: 'Conector encontrado' })
  @ApiResponse({ status: 404, description: 'Conector no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un conector RJ45' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del conector' })
  @ApiResponse({ status: 200, description: 'Conector actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'Conector no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRj45ConnectorDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un conector RJ45' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del conector' })
  @ApiResponse({ status: 200, description: 'Conector eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Conector no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
