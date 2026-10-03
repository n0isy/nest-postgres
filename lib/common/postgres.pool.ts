import { Logger } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import {
  PostgresPool,
  PostgresTransactionCallback,
} from '../interfaces/postgres-pool.interface';

const logger = new Logger('PostgresPool');

export class TransactionalPostgresPool extends Pool implements PostgresPool {
  async transaction<T>(callback: PostgresTransactionCallback<T>): Promise<T> {
    const client = await this.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await this.rollback(client);
      throw error;
    } finally {
      client.release();
    }
  }

  private async rollback(client: PoolClient) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error(
        'Unable to rollback PostgreSQL transaction.',
        rollbackError instanceof Error ? rollbackError.stack : undefined,
      );
    }
  }
}
