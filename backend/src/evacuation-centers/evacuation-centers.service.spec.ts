import { Test, TestingModule } from '@nestjs/testing';
import { EvacuationCentersService } from './evacuation-centers.service';

describe('EvacuationCentersService', () => {
  let service: EvacuationCentersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvacuationCentersService],
    }).compile();

    service = module.get<EvacuationCentersService>(EvacuationCentersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
