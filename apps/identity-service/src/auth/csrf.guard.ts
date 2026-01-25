import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

/**
 * CSRF Protection Guard using Origin/Referer validation.
 * 
 * This guard mitigates CSRF attacks for state-changing endpoints when cookies
 * are configured with sameSite='none' (required for cross-origin credentialed requests).
 * 
 * How it works:
 * - Validates that the Origin or Referer header matches the allowed origins
 * - Browsers automatically include Origin/Referer headers in requests
 * - Attackers cannot spoof these headers from cross-origin contexts
 * 
 * Apply to all state-changing endpoints: login, register, switch-org, logout, refresh
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */
@Injectable()
export class CsrfGuard implements CanActivate {
    private readonly allowedOrigins: Set<string>;

    constructor() {
        const corsOrigins = process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
            : ['http://localhost:3000'];

        // Also include the API server itself (for same-origin requests)
        const apiUrl = process.env.API_URL || 'http://localhost:3001';
        this.allowedOrigins = new Set([...corsOrigins, apiUrl]);
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const origin = request.headers.origin;
        const referer = request.headers.referer;

        // Extract origin from referer if origin header is missing
        // (some browsers don't send origin for same-origin requests)
        let requestOrigin = origin;
        if (!requestOrigin && referer) {
            try {
                const url = new URL(referer);
                requestOrigin = url.origin;
            } catch {
                // Invalid referer URL, will fail validation
            }
        }

        // If no origin/referer header present, reject the request
        // This can happen with direct API calls without browser context,
        // but such calls can't have cookies attached in CORS context
        if (!requestOrigin) {
            // For development/testing, allow requests without origin when not in production
            // and credentials (cookies) are not present
            const hasCredentials = !!request.cookies?.accessToken || !!request.cookies?.refreshToken;
            
            if (process.env.NODE_ENV !== 'production' && !hasCredentials) {
                return true;
            }
            
            throw new ForbiddenException('CSRF validation failed: Missing origin header');
        }

        // Validate that the origin is in our allowed list
        if (!this.allowedOrigins.has(requestOrigin)) {
            throw new ForbiddenException('CSRF validation failed: Invalid origin');
        }

        return true;
    }
}
