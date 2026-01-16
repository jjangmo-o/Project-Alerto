import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ReportsGateway {
  @WebSocketServer()
  server: Server;

  // ---------------------------
  // CITY-WIDE FEED (DEFAULT)
  // ---------------------------

  @SubscribeMessage('joinCity')
  handleJoinCity(@ConnectedSocket() client: Socket) {
    client.join('city:marikina');
    return { joined: 'city:marikina' };
  }

  @SubscribeMessage('leaveCity')
  handleLeaveCity(@ConnectedSocket() client: Socket) {
    client.leave('city:marikina');
    return { left: 'city:marikina' };
  }

  // ---------------------------
  // BARANGAY-SPECIFIC FEED
  // ---------------------------

  @SubscribeMessage('joinBarangay')
  handleJoinBarangay(
    @ConnectedSocket() client: Socket,
    @MessageBody() barangayId: string,
  ) {
    const room = `barangay:${barangayId}`;
    client.join(room);
    return { joined: room };
  }

  @SubscribeMessage('leaveBarangay')
  handleLeaveBarangay(
    @ConnectedSocket() client: Socket,
    @MessageBody() barangayId: string,
  ) {
    const room = `barangay:${barangayId}`;
    client.leave(room);
    return { left: room };
  }

  // ---------------------------
  // EMIT EVENTS
  // ---------------------------

  emitNewReport(barangayId: string, report: any) {
    // City-wide feed
    this.server.to('city:marikina').emit('report:new', report);

    // Barangay-specific feed
    this.server.to(`barangay:${barangayId}`).emit('report:new', report);
  }

  emitRemovedReport(barangayId: string, reportId: string) {
    this.server.to('city:marikina').emit('report:removed', reportId);
    this.server.to(`barangay:${barangayId}`).emit('report:removed', reportId);
  }
}
