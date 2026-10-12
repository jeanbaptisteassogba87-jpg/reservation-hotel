import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  equipements?: string;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;

  @IsInt()
  categoryId: number;
}
