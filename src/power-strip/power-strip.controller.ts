import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { PowerStripService } from './power-strip.service';
import { CreatePowerStripDto } from './dto/create-power-strip.dto';
import { UpdatePowerStripDto } from './dto/update-power-strip.dto';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';

// ✅ Decoradores reutilizables
const ApiIdParam = () =>
  ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del multicontacto',
    example: 1,
  });

const ApiBadRequest = (description = 'Datos inválidos') =>
  ApiBadRequestResponse({ description });

const ApiNotFound = (description = 'Multicontacto no encontrado') =>
  ApiNotFoundResponse({ description });


@ApiTags('Power Strips')
@AdminOnly()
@Controller('power-strips')
export class PowerStripController {
  constructor(private readonly service: PowerStripService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo multicontacto' })
  @ApiCreatedResponse({
    description: 'Multicontacto creado exitosamente',
    type: CreatePowerStripDto,
  })
  @ApiBadRequest()
  @ApiBody({ type: CreatePowerStripDto })
  create(@Body() createDto: CreatePowerStripDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los multicontactos' })
  @ApiOkResponse({
    description: 'Lista de multicontactos',
    type: [CreatePowerStripDto],
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un multicontacto por ID' })
  @ApiIdParam()
  @ApiOkResponse({
    description: 'Multicontacto encontrado',
    type: CreatePowerStripDto,
  })
  @ApiNotFound()
  @ApiBadRequest('ID inválido')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.service.findOne(id);
    if (!item) throw new NotFoundException(`Power strip with ID ${id} not found`);
    return item;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un multicontacto' })
  @ApiIdParam()
  @ApiBody({ type: UpdatePowerStripDto })
  @ApiOkResponse({
    description: 'Multicontacto actualizado',
    type: UpdatePowerStripDto,
  })
  @ApiNotFound()
  @ApiBadRequest()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePowerStripDto,
  ) {
    const updated = await this.service.update(id, updateDto);
    if (!updated) throw new NotFoundException(`Power strip with ID ${id} not found`);
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un multicontacto' })
  @ApiIdParam()
  @ApiNoContentResponse({ description: 'Multicontacto eliminado' })
  @ApiNotFound()
  @ApiBadRequest('ID inválido')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.service.remove(id);
    if (!deleted) throw new NotFoundException(`Power strip with ID ${id} not found`);
  }
}
