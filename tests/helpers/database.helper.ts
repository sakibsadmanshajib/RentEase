import { Sequelize, Options } from 'sequelize';

export class DatabaseHelper {
    private connections: Map<string, Sequelize> = new Map();

    /**
     * Connect to a service database
     */
    async connect(serviceName: string, config: Options): Promise<Sequelize> {
        const sequelize = new Sequelize({
            ...config,
            logging: false,
        });

        try {
            await sequelize.authenticate();
            this.connections.set(serviceName, sequelize);
            console.log(`✓ Connected to ${serviceName} database`);
            return sequelize;
        } catch (error) {
            console.error(`✗ Failed to connect to ${serviceName} database:`, error);
            throw error;
        }
    }

    /**
     * Truncate specified tables for clean test state
     */
    async cleanup(serviceName: string, tables: string[]): Promise<void> {
        const sequelize = this.connections.get(serviceName);
        if (!sequelize) {
            throw new Error(`No connection found for ${serviceName}`);
        }

        try {
            // Disable foreign key checks temporarily
            await sequelize.query('SET CONSTRAINTS ALL DEFERRED');

            for (const table of tables) {
                await sequelize.query(`TRUNCATE TABLE "${table}" CASCADE`);
            }

            console.log(`✓ Cleaned up ${tables.length} tables in ${serviceName}`);
        } catch (error) {
            console.error(`✗ Failed to cleanup tables in ${serviceName}:`, error);
            throw error;
        }
    }

    /**
     * Execute raw SQL query
     */
    async query(serviceName: string, sql: string, replacements?: any): Promise<any> {
        const sequelize = this.connections.get(serviceName);
        if (!sequelize) {
            throw new Error(`No connection found for ${serviceName}`);
        }

        return sequelize.query(sql, { replacements });
    }

    /**
     * Close connection for a specific service
     */
    async close(serviceName: string): Promise<void> {
        const sequelize = this.connections.get(serviceName);
        if (sequelize) {
            await sequelize.close();
            this.connections.delete(serviceName);
            console.log(`✓ Closed connection to ${serviceName}`);
        }
    }

    /**
     * Close all database connections
     */
    async closeAll(): Promise<void> {
        for (const [name, sequelize] of this.connections) {
            try {
                await sequelize.close();
                console.log(`✓ Closed connection to ${name}`);
            } catch (error) {
                console.error(`✗ Failed to close connection to ${name}:`, error);
            }
        }
        this.connections.clear();
    }

    /**
     * Get connection for a service
     */
    getConnection(serviceName: string): Sequelize {
        const sequelize = this.connections.get(serviceName);
        if (!sequelize) {
            throw new Error(`No connection found for ${serviceName}`);
        }
        return sequelize;
    }
}

// Singleton instance
export const dbHelper = new DatabaseHelper();
