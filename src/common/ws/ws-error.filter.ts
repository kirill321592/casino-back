import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

/**
 * Turns thrown errors (validation included) into a `game:error` event instead of
 * the default opaque "Internal server error" payload.
 */
@Catch()
export class WsErrorFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    client.emit('game:error', { message: this.toMessage(exception) });
  }

  private toMessage(exception: unknown): string {
    if (exception instanceof WsException) {
      const error = exception.getError();
      return typeof error === 'string' ? error : exception.message;
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse() as string | { message?: string | string[] };
      if (typeof response === 'string') return response;
      const message = response.message;
      if (Array.isArray(message)) return message.join(', ');
      if (message) return message;
      return exception.message;
    }
    this.logger.error('Unhandled gateway error', exception);
    return 'Unexpected server error';
  }
}
