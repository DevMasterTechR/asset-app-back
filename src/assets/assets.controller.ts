import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo activo',
    description: 'Crea un nuevo activo en el sistema',
  })
  @ApiCreatedResponse({
    description: 'Activo creado exitosamente',
    type: CreateAssetDto,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos para crear un activo' })
  @ApiBody({ type: CreateAssetDto })
  create(@Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los activos',
    description: 'Retorna la lista de todos los activos registrados',
  })
  @ApiOkResponse({
    description: 'Lista de activos obtenida exitosamente',
    type: [CreateAssetDto],
  })
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un activo por ID',
    description: 'Retorna un activo específico según su ID',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del activo',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Activo encontrado',
    type: CreateAssetDto,
  })
  @ApiNotFoundResponse({ description: 'Activo no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar un activo',
    description: 'Actualiza la información de un activo existente',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del activo a actualizar',
    example: 1,
  })
  @ApiBody({ type: UpdateAssetDto })
  @ApiOkResponse({
    description: 'Activo actualizado exitosamente',
    type: UpdateAssetDto,
  })
  @ApiNotFoundResponse({ description: 'Activo no encontrado' })
  @ApiBadRequestResponse({ description: 'Datos inválidos para actualizar el activo' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssetDto) {
    return this.assetsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un activo',
    description: 'Elimina un activo del sistema',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del activo a eliminar',
    example: 1,
  })
  @ApiNoContentResponse({ description: 'Activo eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Activo no encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.remove(id);
  }
}
