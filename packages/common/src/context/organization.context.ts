import { AsyncLocalStorage } from 'async_hooks';

export class OrganizationContext {
    private static storage = new AsyncLocalStorage<string>();

    static run(orgId: string, callback: () => void) {
        this.storage.run(orgId, callback);
    }

    static getOrgId(): string | undefined {
        return this.storage.getStore();
    }
}
