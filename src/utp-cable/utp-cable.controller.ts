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
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UtpCableService } from './utp-cable.service';
import { CreateUtpCableDto } from './dto/create-utp-cable.dto';
import { UpdateUtpCableDto } from './dto/update-utp-cable.dto';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';

@UseGuards(JwtAuthGuard, SessionGuard,RolesGuard)
@AdminOnly()
@ApiTags('UTP Cables')
@Controller('utp-cables')
export class UtpCableController {
  constructor(private readonly utpCableService: UtpCableService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo cable UTP',
    description: 'Crea un nuevo registro de cable UTP en el sistema',
  })
  @ApiCreatedResponse({
    description: 'Cable UTP creado exitosamente',
    type: CreateUtpCableDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos',
  })
  @ApiBody({
    type: CreateUtpCableDto,
    description: 'Datos del cable UTP a crear',
  })
  create(@Body() dto: CreateUtpCableDto) {
    return this.utpCableService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los cables UTP',
    description: 'Retorna una lista de todos los cables UTP registrados',
  })
  @ApiOkResponse({
    description: 'Lista de cables UTP obtenida exitosamente',
    type: [CreateUtpCableDto],
  })
  findAll() {
    return this.utpCableService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un cable UTP por ID',
    description: 'Retorna un cable UTP específico basado en su ID',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del cable UTP',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Cable UTP encontrado',
    type: CreateUtpCableDto,
  })
  @ApiNotFoundResponse({
    description: 'Cable UTP no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'ID inválido',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.utpCableService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar un cable UTP',
    description: 'Actualiza los datos de un cable UTP existente',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del cable UTP a actualizar',
    example: 1,
  })
  @ApiBody({
    type: UpdateUtpCableDto,
    description: 'Datos actualizados del cable UTP',
  })
  @ApiOkResponse({
    description: 'Cable UTP actualizado exitosamente',
    type: UpdateUtpCableDto,
  })
  @ApiNotFoundResponse({
    description: 'Cable UTP no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUtpCableDto,
  ) {
    return this.utpCableService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un cable UTP',
    description: 'Elimina un cable UTP del sistema',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del cable UTP a eliminar',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Cable UTP eliminado exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Cable UTP no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'ID inválido',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.utpCableService.remove(id);
  }
}