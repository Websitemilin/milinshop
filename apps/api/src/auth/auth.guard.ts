import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') implements CanActivate {
  constructor(private readonly _reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First run passport JWT to set request.user
    try {
      await super.canActivate(context);
    } catch (err) {
      throw new UnauthorizedException('Authentication required');
    }

    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return true;
  }
}
