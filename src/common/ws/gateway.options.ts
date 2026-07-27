import { ValidationPipe } from '@nestjs/common';
import { GatewayMetadata } from '@nestjs/websockets';

/** Every game gateway lives on its own namespace but shares this setup. */
export function gatewayOptions(namespace: string): GatewayMetadata {
  return { namespace, cors: { origin: true, credentials: true } };
}

export const wsValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});
