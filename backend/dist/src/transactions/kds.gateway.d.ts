import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class KdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(client: Socket, data: {
        outletId?: string;
    }): void;
    handleLeave(client: Socket, data: {
        outletId?: string;
    }): void;
    emitNewOrder(transaction: any): void;
    emitOrderUpdated(transaction: any): void;
}
