import { Sequelize, QueryInterface } from 'sequelize';

export interface MigrationContext {
    context: Sequelize;
}

export type Migration = (params: MigrationContext) => Promise<void>;

export interface MigrationMeta {
    name: string;
    up: Migration;
    down: Migration;
}
