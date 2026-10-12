import { Test, TestingModule } from '@nestjs/testing';
import { RoomCategoriesController } from './room-categories.controller.js';

describe('RoomCategoriesController', () => {
  let controller: RoomCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomCategoriesController],
    }).compile();

    controller = module.get<RoomCategoriesController>(RoomCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
