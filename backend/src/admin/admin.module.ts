import { Module } from '@nestjs/common';
import { AdminEventsController } from './admin-events.controller';
import { HazardsModule } from '../hazards/hazards.module';

@Module({
  imports: [HazardsModule],
  controllers: [AdminEventsController],
})
export class AdminModule {}
