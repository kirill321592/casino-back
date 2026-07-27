import { Logger, OnModuleInit, UseFilters, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { env } from '../../common/config/env';
import { gatewayOptions, wsValidationPipe } from '../../common/ws/gateway.options';
import { WsErrorFilter } from '../../common/ws/ws-error.filter';
import { PlaceBetDto } from './dto/place-bet.dto';
import { ROULETTE_NAMESPACE } from './roulette.constants';
import { RouletteService } from './roulette.service';

@WebSocketGateway(gatewayOptions(ROULETTE_NAMESPACE))
@UsePipes(wsValidationPipe)
@UseFilters(WsErrorFilter)
export class RouletteGateway implements OnModuleInit {
  private readonly logger = new Logger(RouletteGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly roulette: RouletteService) {}

  onModuleInit() {
    this.scheduleRound();
    this.logger.log('Roulette round loop started');
  }

  handleConnection(client: Socket) {
    client.emit('round:state', this.roulette.getState());
  }

  @SubscribeMessage('bet:place')
  placeBet(@ConnectedSocket() client: Socket, @MessageBody() bet: PlaceBetDto) {
    try {
      const placed = this.roulette.placeBet(client.id, bet);
      client.emit('bet:accepted', placed);
      this.server.emit('round:state', this.roulette.getState());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to place bet';
      client.emit('bet:rejected', { message });
    }
  }

  private scheduleRound() {
    setTimeout(() => {
      this.server.emit('round:result', this.roulette.spin());
      setTimeout(() => {
        this.server.emit('round:state', this.roulette.startNextRound());
        this.scheduleRound();
      }, env.roundBreakMs);
    }, env.roundDurationMs);
  }
}
