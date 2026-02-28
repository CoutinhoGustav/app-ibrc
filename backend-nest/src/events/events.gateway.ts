import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('mark_attendance')
    handleMarkAttendance(client: Socket, payload: any) {
        // Broadcast to all other clients
        this.server.emit('attendance_marked', payload);
        this.server.emit('attendance_update', payload); // For Dashboard
    }

    // Helper method to be called from services
    emitSystemStatusChange(isActive: boolean) {
        this.server.emit('system_status_change', { isActive });
    }
}
