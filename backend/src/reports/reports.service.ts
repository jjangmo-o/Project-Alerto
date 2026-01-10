import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsGateway } from './reports.gateway';

@Injectable()
export class ReportsService {
  private reports: any[] = [];

  constructor(private readonly reportsGateway: ReportsGateway) {}

  create(dto: any) {
  const report = {
    id: crypto.randomUUID(),
    ...dto,
    createdAt: new Date(),
    isRemoved: false,
  };

  this.reports.push(report);

  this.reportsGateway.emitNewReport(dto.barangayId, report);

  return report;
}


  findAll() {
    return this.reports.filter(r => !r.isRemoved);
  }

  findByBarangay(barangayId: string) {
    return this.reports.filter(
      r => r.barangayId === barangayId && !r.isRemoved,
    );
  }

  remove(reportId: string) {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return;

    report.isRemoved = true;

    this.reportsGateway.emitRemovedReport(
      report.barangayId,
      reportId,
    );
  }
}
