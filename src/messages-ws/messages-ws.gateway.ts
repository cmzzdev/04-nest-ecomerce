import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtPayload } from '../auth/interfaces';


@WebSocketGateway({cors: true, namespace: '/'})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    // console.log(client)
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id)
    } catch (error) {
      client.disconnect();
      return;
    }
    // console.log({payload})
    // console.log('Client connected: ', client.id)
    // console.log({connectedClients: this.messagesWsService.getConnectedClients()})
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  handleDisconnect(client: Socket) {
    // console.log('Client Disconnected: ', client.id)
    this.messagesWsService.removeClient(client.id)
    // console.log({connectedClients: this.messagesWsService.getConnectedClients()})
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  @SubscribeMessage('message-from-client')
  // async if you need it
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    
    // this only emit to the same client
    // client.emit('message-from-server', {
    //   fullName: 'Im here!',
    //   message: payload.message || 'no-message!!',
    // })

    // emit messate to all clients (broadcast) but NO to the emitter client
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'emitter user name',
    //   message: payload.message || 'no-message!!',
    // })

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!',
    })
  }

}
