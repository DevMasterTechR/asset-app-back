import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

// ✅ Decoradores reutilizables
const ApiIdParam = () =>
  ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de la credencial',
    example: 1,
  });

const ApiBadRequest = (description = 'Solicitud inválida') =>
  ApiBadRequestResponse({ description });

const ApiNotFound = (description = 'Credencial no encontrada') =>
  ApiNotFoundResponse({ description });

@UseGuards(JwtAuthGuard, SessionGuard)
@ApiTags('Credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly service: CredentialsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una credencial' })
  @ApiCreatedResponse({
    description: 'Credencial creada correctamente',
    type: CreateCredentialDto,
  })
  @ApiBadRequest()
  @ApiBody({ type: CreateCredentialDto })
  create(@Body() dto: CreateCredentialDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las credenciales' })
  @ApiOkResponse({
    description: 'Lista de credenciales',
    type: [CreateCredentialDto],
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una credencial por ID' })
  @ApiIdParam()
  @ApiOkResponse({
    description: 'Credencial encontrada',
    type: CreateCredentialDto,
  })
  @ApiNotFound()
  @ApiBadRequest()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const credential = await this.service.findOne(id);
    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }
    return credential;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una credencial' })
  @ApiIdParam()
  @ApiBody({ type: UpdateCredentialDto })
  @ApiOkResponse({
    description: 'Credencial actualizada correctamente',
    type: UpdateCredentialDto,
  })
  @ApiNotFound()
  @ApiBadRequest()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCredentialDto,
  ) {
    const updated = await this.service.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una credencial' })
  @ApiIdParam()
  @ApiNoContentResponse({ description: 'Credencial eliminada correctamente' })
  @ApiNotFound()
  @ApiBadRequest()
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.service.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }
  }
}
