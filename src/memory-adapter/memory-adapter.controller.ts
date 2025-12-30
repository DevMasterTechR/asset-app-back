import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MemoryAdapterService } from './memory-adapter.service';
import { CreateMemoryAdapterDto } from './dto/create-memory-adapter.dto';
import { UpdateMemoryAdapterDto } from './dto/update-memory-adapter.dto';

@ApiTags('memory-adapter')
@Controller('memory-adapter')
export class MemoryAdapterController {
  constructor(private readonly service: MemoryAdapterService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo adaptador de memoria' })
  create(@Body() dto: CreateMemoryAdapterDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los adaptadores de memoria' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener adaptador de memoria por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar adaptador de memoria' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMemoryAdapterDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar adaptador de memoria' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
