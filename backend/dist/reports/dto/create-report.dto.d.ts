export declare enum ReportStatus {
    SAFE = "SAFE",
    NEED_HELP = "NEED_HELP",
    INJURED = "INJURED",
    MISSING = "MISSING",
    TRAPPED = "TRAPPED"
}
export declare class CreateReportDto {
    status: ReportStatus;
    barangayId: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    media?: {
        url: string;
        type: 'image' | 'video';
    }[];
}
