import { Module } from '@nestjs/common';
import { EvacuationCentersController } from './evacuation-centers.controller';
import { EvacuationCentersService } from './evacuation-centers.service';
import { MapboxRoutingService } from './routing/mapbox-routing.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { HazardsModule } from 'src/hazards/hazards.module';

@Module({
  imports: [SupabaseModule, HazardsModule],
  controllers: [EvacuationCentersController],
  providers: [EvacuationCentersService, MapboxRoutingService],
})
export class EvacuationCentersModule {}
