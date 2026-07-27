import { UseFilters, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { gatewayOptions, wsValidationPipe } from '../../common/ws/gateway.options';
import { WsErrorFilter } from '../../common/ws/ws-error.filter';
import { SpinSlotsDto } from './dto/spin-slots.dto';
import { SLOTS_NAMESPACE } from './slots.constants';
import { SlotsService } from './slots.service';

@WebSocketGateway(gatewayOptions(SLOTS_NAMESPACE))
@UsePipes(wsValidationPipe)
@UseFilters(WsErrorFilter)
export class SlotsGateway {
  constructor(private readonly slots: SlotsService) {}

  handleConnection(client: Socket) {
    client.emit('slots:paytable', this.slots.getPaytable());
  }

  @SubscribeMessage('slots:spin')
  spin(@ConnectedSocket() client: Socket, @MessageBody() { bet }: SpinSlotsDto) {
    client.emit('slots:result', this.slots.spin(bet));
  }
}
