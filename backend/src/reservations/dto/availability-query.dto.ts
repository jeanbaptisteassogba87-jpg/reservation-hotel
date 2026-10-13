import { Matches } from 'class-validator';

export class AvailabilityQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateArrivee doit être AAAA-MM-JJ',
  })
  dateArrivee: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateDepart doit être AAAA-MM-JJ',
  })
  dateDepart: string;
}
