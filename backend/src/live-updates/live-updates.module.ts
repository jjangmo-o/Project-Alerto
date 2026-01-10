import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { LiveUpdatesService } from './live-updates.service';

@Module({
  imports: [SupabaseModule],
  providers: [LiveUpdatesService],
})
export class LiveUpdatesModule {}
