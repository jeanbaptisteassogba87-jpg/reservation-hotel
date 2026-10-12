import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { RoomCategoriesService } from './room-categories.service.js';
import { CreateRoomCategoryDto } from './dto/create-room-category.dto.js';
import { UpdateRoomCategoryDto } from './dto/update-room-category.dto.js';

@Controller('room-categories')
export class RoomCategoriesController {
  constructor(private readonly service: RoomCategoriesService) {}

  @Post()
  create(@Body() dto: CreateRoomCategoryDto) {
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

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}