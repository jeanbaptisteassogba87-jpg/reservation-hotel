import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateReservationDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateArrivee doit être AAAA-MM-JJ',
  })
  dateArrivee: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateDepart doit être AAAA-MM-JJ',
  })
  dateDepart: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  roomIds: number[];

  @IsOptional()
  @IsInt()
  clientId?: number;
}
