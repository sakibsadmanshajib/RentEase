import { AsyncLocalStorage } from 'async_hooks';

export class OrganizationContext {
    private static storage = new AsyncLocalStorage<string>();

    static run<T>(orgId: string, callback: () => T): T {
        return this.storage.run(orgId, callback);
    }

    static getOrgId(): string | undefined {
        return this.storage.getStore();
    }
}
