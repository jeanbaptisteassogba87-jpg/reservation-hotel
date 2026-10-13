import { Module } from '@nestjs/common';
import { RoomCategoriesController } from './room-categories.controller.js';
import { RoomCategoriesService } from './room-categories.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomCategory } from './entities/room-category.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([RoomCategory])],
  controllers: [RoomCategoriesController],
  providers: [RoomCategoriesService],
})
export class RoomCategoriesModule {}
