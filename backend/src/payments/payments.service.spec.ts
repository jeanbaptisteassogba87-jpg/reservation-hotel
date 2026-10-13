import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service.js';
import { Payment } from './entities/payment.entity.js';
import { Reservation } from '../reservations/entities/reservation.entity.js';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            find: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: {
            findOne: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
