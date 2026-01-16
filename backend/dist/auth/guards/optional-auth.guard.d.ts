import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class OptionalAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
