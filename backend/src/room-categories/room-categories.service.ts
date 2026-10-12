import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomCategory } from './entities/room-category.entity.js';
import { CreateRoomCategoryDto } from './dto/create-room-category.dto.js';
import { UpdateRoomCategoryDto } from './dto/update-room-category.dto.js';

@Injectable()
export class RoomCategoriesService {
  constructor(
    @InjectRepository(RoomCategory)
    private readonly repo: Repository<RoomCategory>,
  ) {}

  async create(dto: CreateRoomCategoryDto): Promise<RoomCategory> {
    const category = this.repo.create(dto);
    return await this.repo.save(category);
  }

  async findAll(): Promise<RoomCategory[]> {
    return await this.repo.find();
  }

  async findOne(id: number): Promise<RoomCategory> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`RoomCategory #${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    dto: UpdateRoomCategoryDto,
  ): Promise<RoomCategory> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return await this.repo.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.repo.remove(category);
  }
}