import { SupabaseService } from '../supabase/supabase.service';
export declare class NotificationsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    logEvent(type: string, payload: any, severity: string, referenceKey?: string): Promise<void>;
}
