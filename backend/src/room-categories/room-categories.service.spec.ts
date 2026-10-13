import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoomCategoriesService } from './room-categories.service.js';
import { RoomCategory } from './entities/room-category.entity.js';

describe('RoomCategoriesService', () => {
  let service: RoomCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomCategoriesService,
        {
          provide: getRepositoryToken(RoomCategory),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            find: vi.fn(),
            findOne: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoomCategoriesService>(RoomCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
