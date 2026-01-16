import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async logEvent(
    type: string,
    payload: any,
    severity: string,
    referenceKey?: string,
  ) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('notification_events')
      .insert({
        type,
        payload,
        severity,
        reference_key: referenceKey,
      });

    if (error) {
      throw error;
    }
  }
}
