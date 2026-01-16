import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EvacuationCentersModule } from './evacuation-centers/evacuation-centers.module';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { HealthModule } from './evacuation-centers/health/health.module';
import { HazardsModule } from './hazards/hazards.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    AuthModule,
    EvacuationCentersModule,
    HealthModule, 
    HazardsModule,
    AdminModule,
  ],
})
export class AppModule {}
