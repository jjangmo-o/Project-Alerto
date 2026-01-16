import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Always allow
    return true;
  }
}
