import { Logger, OnModuleInit, UnauthorizedException, UseFilters, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AUTH_COOKIE, readBearer, readCookie } from '../../auth/auth.cookie';
import { AuthService } from '../../auth/auth.service';
import { env } from '../../common/config/env';
import { validationPipe } from '../../common/validation';
import { gatewayOptions } from '../../common/ws/gateway.options';
import { WsErrorFilter } from '../../common/ws/ws-error.filter';
import { UsersService } from '../../users/users.service';
import { PlaceBetDto } from './dto/place-bet.dto';
import { ROULETTE_NAMESPACE } from './roulette.constants';
import { RouletteService } from './roulette.service';

@WebSocketGateway(gatewayOptions(ROULETTE_NAMESPACE))
@UsePipes(validationPipe)
@UseFilters(WsErrorFilter)
export class RouletteGateway implements OnModuleInit, OnGatewayConnection {
  private readonly logger = new Logger(RouletteGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly roulette: RouletteService,
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  onModuleInit() {
    this.scheduleRound();
    this.logger.log('Roulette round loop started');
  }

  /**
   * The socket is authenticated once, at the handshake, and the account is pinned
   * to it for its lifetime — so a later `bet:place` cannot name someone else's id.
   */
  async handleConnection(client: Socket) {
    try {
      const token = tokenFrom(client);
      if (!token) throw new UnauthorizedException('Sign in to play');

      const user = await this.auth.verify(token);
      client.data.userId = user.id;
      client.emit('session:balance', { balance: user.balance });
      client.emit('round:state', this.roulette.getState());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in to play';
      client.emit('game:error', { message });
      client.disconnect();
    }
  }

  @SubscribeMessage('bet:place')
  placeBet(@ConnectedSocket() client: Socket, @MessageBody() bet: PlaceBetDto) {
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      client.emit('bet:rejected', { message: 'Sign in to play' });
      return;
    }

    try {
      const { bet: placed, balance } = this.roulette.placeBet(userId, bet);
      client.emit('bet:accepted', { ...placed, balance });
      this.server.emit('round:state', this.roulette.getState());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to place bet';
      client.emit('bet:rejected', { message });
    }
  }

  private scheduleRound() {
    setTimeout(() => {
      // The next round is scheduled even if settling threw: one bad round must
      // not be able to stop the table for everyone still sitting at it.
      void this.settleRound()
        .catch((error) => this.logger.error('Failed to settle round', error))
        .finally(() => {
          setTimeout(() => {
            this.server.emit('round:state', this.roulette.startNextRound());
            this.scheduleRound();
          }, env.roundBreakMs);
        });
    }, env.roundDurationMs);
  }

  /* Payouts are private, so the result goes out per socket rather than broadcast. */
  private async settleRound() {
    const { number, payouts } = this.roulette.spin();

    for (const socket of await this.server.fetchSockets()) {
      const userId = socket.data.userId as string | undefined;
      if (!userId) continue;

      socket.emit('round:result', {
        number,
        payout: payouts[userId] ?? 0,
        balance: this.users.getBalance(userId),
      });
    }
  }
}

/** The browser sends a cookie; other clients can hand the token to the handshake. */
function tokenFrom(client: Socket): string | undefined {
  const { auth, headers } = client.handshake;
  const handshakeToken = typeof auth?.token === 'string' ? auth.token : undefined;

  return (
    readCookie(headers.cookie, AUTH_COOKIE) ?? handshakeToken ?? readBearer(headers.authorization)
  );
}
