import { Server } from 'socket.io';
export declare class HazardEventsGateway {
    server: Server;
    emitHazardStatus(status: {
        flood: boolean;
        earthquake: boolean;
    }): void;
}
