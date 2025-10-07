import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { Rj45ConnectorService } from './rj45-connector.service';
import { CreateRj45ConnectorDto } from './dto/create-rj45-connector.dto';
import { UpdateRj45ConnectorDto } from './dto/update-rj45-connector.dto';

@Controller('rj45-connectors')
export class Rj45ConnectorController {
  constructor(private readonly service: Rj45ConnectorService) {}

  @Post()
  create(@Body() createDto: CreateRj45ConnectorDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateRj45ConnectorDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
