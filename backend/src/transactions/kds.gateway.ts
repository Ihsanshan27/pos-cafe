import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Kitchen Display System (KDS) WebSocket Gateway.
 *
 * Events emitted by server:
 * - `order:new`        – New order has arrived (transaction created)
 * - `order:updated`    – Order kitchen status changed
 * - `order:list`       – Full list of active KDS orders (sent on join)
 *
 * Events from client:
 * - `kds:join`         – Client joins a room (by outletId or 'all')
 * - `kds:leave`        – Client leaves a room
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/kds',
})
export class KdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`KDS client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`KDS client disconnected: ${client.id}`);
  }

  @SubscribeMessage('kds:join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { outletId?: string }) {
    const room = data?.outletId ? `outlet:${data.outletId}` : 'all';
    client.join(room);
    client.emit('kds:joined', { room });
  }

  @SubscribeMessage('kds:leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { outletId?: string }) {
    const room = data?.outletId ? `outlet:${data.outletId}` : 'all';
    client.leave(room);
  }

  /**
   * Emit a new order event to all relevant clients.
   * Called by TransactionsService after creating a new transaction.
   */
  emitNewOrder(transaction: any) {
    const outletId = transaction.outletId;
    if (outletId) {
      this.server.to(`outlet:${outletId}`).emit('order:new', transaction);
    }
    this.server.to('all').emit('order:new', transaction);
  }

  /**
   * Emit an order update event to all relevant clients.
   * Called by TransactionsService after updating kitchen status.
   */
  emitOrderUpdated(transaction: any) {
    const outletId = transaction.outletId;
    if (outletId) {
      this.server.to(`outlet:${outletId}`).emit('order:updated', transaction);
    }
    this.server.to('all').emit('order:updated', transaction);
  }
}
