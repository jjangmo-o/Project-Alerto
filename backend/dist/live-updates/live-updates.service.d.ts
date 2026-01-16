import { SupabaseService } from '../supabase/supabase.service';
export declare class LiveUpdatesService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    updateState(key: string, value: any, severity: string, source: string): Promise<void>;
    getCurrentState(): Promise<any[]>;
}
