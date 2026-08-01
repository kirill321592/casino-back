import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users/users.types';
import { AuthedRequest } from './auth.types';

/** The account AuthGuard resolved. Only valid on routes that use that guard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User =>
    context.switchToHttp().getRequest<AuthedRequest>().user,
);
