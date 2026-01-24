import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { OrganizationContext } from './organization.context';

@Injectable()
export class OrganizationContextInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        // Priority: EXTRACT FROM TOKEN
        const orgId = req.user?.orgId || req.user?.tenantId; 

        if (orgId) {
            return new Observable((subscriber) => {
                OrganizationContext.run(orgId, async () => {
                    try {
                        const result = await next.handle().toPromise();
                        subscriber.next(result);
                        subscriber.complete();
                    } catch (err) {
                        subscriber.error(err);
                    }
                });
            });
        }
        
        return next.handle();
    }
}
