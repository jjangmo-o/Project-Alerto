import { Server, Socket } from 'socket.io';
export declare class ReportsGateway {
    server: Server;
    handleJoinCity(client: Socket): {
        joined: string;
    };
    handleLeaveCity(client: Socket): {
        left: string;
    };
    handleJoinBarangay(client: Socket, barangayId: string): {
        joined: string;
    };
    handleLeaveBarangay(client: Socket, barangayId: string): {
        left: string;
    };
    emitNewReport(barangayId: string, report: any): void;
    emitRemovedReport(barangayId: string, reportId: string): void;
}
