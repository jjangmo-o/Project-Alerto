import { Request } from 'express';
import { MediaService } from '../media/media.service';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    private readonly mediaService;
    constructor(reportsService: ReportsService, mediaService: MediaService);
    create(req: Request & {
        user?: any;
    }, files: Express.Multer.File[], dto: any): Promise<any>;
    findByBarangay(barangayId: string): any[];
}
