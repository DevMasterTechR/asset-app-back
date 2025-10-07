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
import { AssignmentHistoryService } from './assignment-history.service';
import { CreateAssignmentHistoryDto } from './dto/create-assignment-history.dto';
import { UpdateAssignmentHistoryDto } from './dto/update-assignment-history.dto';

@Controller('assignment-history')
export class AssignmentHistoryController {
  constructor(private readonly service: AssignmentHistoryService) {}

  @Post()
  create(@Body() dto: CreateAssignmentHistoryDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssignmentHistoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
