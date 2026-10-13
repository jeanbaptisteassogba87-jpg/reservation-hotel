import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repo.create(dto);
    return await this.repo.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.repo.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
  return await this.repo
    .createQueryBuilder('user')
    .addSelect('user.motDePasse')
    .where('user.email = :email', { email })
    .getOne();
}

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return await this.repo.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.repo.remove(user);
  }
}