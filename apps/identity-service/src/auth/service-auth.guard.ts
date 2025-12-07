import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard for internal service-to-service authentication.
 * Validates the X-Service-Token header against SERVICE_SECRET env var.
 */
@Injectable()
export class ServiceAuthGuard implements CanActivate {
    constructor(private configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const serviceToken = request.headers['x-service-token'];
        const expectedToken = this.configService.get<string>('SERVICE_SECRET');
        
        if (!expectedToken) {
            throw new UnauthorizedException('Service auth not configured');
        }
        
        if (!serviceToken || serviceToken !== expectedToken) {
            throw new UnauthorizedException('Invalid service token');
        }
        
        return true;
    }
}
