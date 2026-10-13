import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomCategoryDto } from './create-room-category.dto.js';

export class UpdateRoomCategoryDto extends PartialType(CreateRoomCategoryDto) {}
