import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class LiveUpdatesService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async updateState(
    key: string,
    value: any,
    severity: string,
    source: string,
  ) {
    const supabase = this.supabaseService.getClient();

    await supabase.from('live_state').upsert({
      key,
      value,
      severity,
      source,
      updated_at: new Date(),
    });
  }

  async getCurrentState() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('live_state')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  }
}
