import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';

@ApiTags('support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un Soporte' })
  create(@Body() createSupportDto: CreateSupportDto) {
    return this.supportService.create(createSupportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los Soportes' })
  findAll() {
    return this.supportService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un Soporte por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supportService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un Soporte' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupportDto: UpdateSupportDto,
  ) {
    return this.supportService.update(id, updateSupportDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un Soporte' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supportService.remove(id);
  }
}
