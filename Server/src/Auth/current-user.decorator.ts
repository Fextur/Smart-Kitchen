import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // If a specific property is requested, return that property
    // Otherwise return the entire user object
    return data ? user[data] : user;
  },
);

// Type for the user object
export interface AuthenticatedUser {
  id: string;
  userName: string;
  iat?: number;
  exp?: number;
}
