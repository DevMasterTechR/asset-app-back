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
import { NetworkAdapterService } from './network-adapter.service';
import { CreateNetworkAdapterDto } from './dto/create-network-adapter.dto';
import { UpdateNetworkAdapterDto } from './dto/update-network-adapter.dto';

@ApiTags('network-adapter')
@Controller('network-adapter')
export class NetworkAdapterController {
  constructor(private readonly networkAdapterService: NetworkAdapterService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un Adaptador de Red' })
  create(@Body() createNetworkAdapterDto: CreateNetworkAdapterDto) {
    return this.networkAdapterService.create(createNetworkAdapterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los Adaptadores de Red' })
  findAll() {
    return this.networkAdapterService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un Adaptador de Red por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.networkAdapterService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un Adaptador de Red' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNetworkAdapterDto: UpdateNetworkAdapterDto,
  ) {
    return this.networkAdapterService.update(id, updateNetworkAdapterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un Adaptador de Red' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.networkAdapterService.remove(id);
  }
}
