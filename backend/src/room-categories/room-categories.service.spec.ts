import { Test, TestingModule } from '@nestjs/testing';
import { RoomCategoriesService } from './room-categories.service.js';

describe('RoomCategoriesService', () => {
  let service: RoomCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomCategoriesService],
    }).compile();

    service = module.get<RoomCategoriesService>(RoomCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
