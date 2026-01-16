import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [NotificationsService],
})
export class NotificationsModule {}
