import { ReportsGateway } from './reports.gateway';
export declare class ReportsService {
    private readonly reportsGateway;
    private reports;
    constructor(reportsGateway: ReportsGateway);
    create(dto: any): any;
    findAll(): any[];
    findByBarangay(barangayId: string): any[];
    remove(reportId: string): void;
}
