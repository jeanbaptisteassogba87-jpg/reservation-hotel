import { Test, TestingModule } from '@nestjs/testing';
import { RoomCategoriesController } from './room-categories.controller.js';
import { RoomCategoriesService } from './room-categories.service.js';

describe('RoomCategoriesController', () => {
  let controller: RoomCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomCategoriesController],
      providers: [{ provide: RoomCategoriesService, useValue: {} }],
    }).compile();

    controller = module.get<RoomCategoriesController>(RoomCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
