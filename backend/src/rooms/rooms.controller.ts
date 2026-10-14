import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  BadRequestException,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RoomsService } from './rooms.service.js';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { UpdateRoomDto } from './dto/update-room.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/enums/role.enum.js';

type UploadedImage = { buffer: Buffer; mimetype: string; size: number };
const uploadsDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'uploads');
const imageExtensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @Post('upload')
  async uploadImage(@UploadedFile() file?: UploadedImage) {
    if (!file) throw new BadRequestException('Sélectionnez une image à envoyer');
    const extension = imageExtensions[file.mimetype];
    if (!extension || !this.hasValidSignature(file)) {
      throw new BadRequestException('Formats acceptés : JPEG, PNG et WebP');
    }

    await mkdir(uploadsDirectory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(join(uploadsDirectory, filename), file.buffer);
    return { imageUrl: `/uploads/${filename}` };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateRoomDto) {
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  private hasValidSignature(file: UploadedImage) {
    if (file.mimetype === 'image/jpeg') {
      return file.buffer.length > 3 && file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
    }
    if (file.mimetype === 'image/png') {
      return file.buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
    }
    return file.mimetype === 'image/webp'
      && file.buffer.toString('ascii', 0, 4) === 'RIFF'
      && file.buffer.toString('ascii', 8, 12) === 'WEBP';
  }
}
