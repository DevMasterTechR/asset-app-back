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
import { PowerStripService } from './power-strip.service';
import { CreatePowerStripDto } from './dto/create-power-strip.dto';
import { UpdatePowerStripDto } from './dto/update-power-strip.dto';

@Controller('power-strips')
export class PowerStripController {
  constructor(private readonly service: PowerStripService) {}

  @Post()
  create(@Body() createDto: CreatePowerStripDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePowerStripDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
