import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// Extend the Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userName: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Authorization token not found');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.TOKEN_SECRET,
      });
      
      // Attach user info to request object for use in controllers/services
      request.user = {
        id: payload.sub,           // User ID from token
        userName: payload.userName, // Username from token
        iat: payload.iat,          // Issued at
        exp: payload.exp,          // Expires at
      };
      
      console.log(`[JwtAuthGuard] Authenticated user: ${request.user.id} (${request.user.userName})`);
      return true;
    } catch (error) {
      console.error('[JwtAuthGuard] Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
