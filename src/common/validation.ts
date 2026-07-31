import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * Shared by both transports: the HTTP controllers and the roulette gateway.
 * Failures collapse into a single `message` string, which is the error shape
 * both protocols document — Nest would otherwise hand back an array over HTTP.
 */
export const validationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  exceptionFactory: (errors) => new BadRequestException(flatten(errors).join(', ')),
});

function flatten(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...flatten(error.children ?? []),
  ]);
}
