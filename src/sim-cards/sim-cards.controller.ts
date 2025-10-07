import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SimCardsService } from './sim-cards.service';
import { CreateSimCardDto } from './dto/create-sim-card.dto';
import { UpdateSimCardDto } from './dto/update-sim-card.dto';

@Controller('sim-cards')
export class SimCardsController {
  constructor(private readonly service: SimCardsService) {}

  @Post()
  create(@Body() dto: CreateSimCardDto) {
    return this.service.create(dto);
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSimCardDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
