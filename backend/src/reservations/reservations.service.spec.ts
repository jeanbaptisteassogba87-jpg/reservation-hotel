import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationChambre } from './entities/reservation-chambre.entity.js';
import { Room } from '../rooms/entities/room.entity.js';
import { User } from '../users/entities/user.entity.js';
import { PaymentsService } from '../payments/payments.service.js';

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            find: vi.fn(),
            findOne: vi.fn(),
            update: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReservationChambre),
          useValue: {
            create: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Room),
          useValue: {
            find: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: vi.fn(),
          },
        },
        {
          provide: PaymentsService,
          useValue: {
            totalPaid: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
