import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class HazardEventsGateway {
  @WebSocketServer()
  server: Server;

  emitHazardStatus(status: {
    flood: boolean;
    earthquake: boolean;
  }) {
    this.server.emit('hazard:update', status);
  }
}
