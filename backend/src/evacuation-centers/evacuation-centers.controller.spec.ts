import { Test, TestingModule } from '@nestjs/testing';
import { EvacuationCentersController } from './evacuation-centers.controller';

describe('EvacuationCentersController', () => {
  let controller: EvacuationCentersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvacuationCentersController],
    }).compile();

    controller = module.get<EvacuationCentersController>(EvacuationCentersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
