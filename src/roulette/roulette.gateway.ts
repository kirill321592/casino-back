import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlaceBetDto } from './dto/place-bet.dto';
import { RouletteService } from './roulette.service';

@WebSocketGateway({ namespace: '/roulette', cors: { origin: true, credentials: true } })
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class RouletteGateway {
  private readonly logger = new Logger(RouletteGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly roulette: RouletteService) {
    this.runRounds();
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

  private runRounds() {
    const schedule = () => setTimeout(() => {
      const result = this.roulette.spin();
      this.server.emit('round:result', result);
      setTimeout(() => {
        this.server.emit('round:state', this.roulette.startNextRound());
        schedule();
      }, 3_000);
    }, Number(process.env.ROUND_DURATION_MS) || 15_000);
    schedule();
    this.logger.log('Roulette round loop started');
  }
}
