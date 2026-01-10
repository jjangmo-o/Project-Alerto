import { Module } from '@nestjs/common';
import { EvacuationCentersController } from './evacuation-centers.controller';
import { EvacuationCentersService } from './evacuation-centers.service';
import { MapboxRoutingService } from './routing/mapbox-routing.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { FloodService } from 'src/hazards/flood.service';
import { EarthquakeService } from '../hazards/earthquake.service';
import { HazardsController } from '../hazards/hazards.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [EvacuationCentersController, HazardsController],
  providers: [EvacuationCentersService, MapboxRoutingService, FloodService, EarthquakeService],
})
export class EvacuationCentersModule {}
