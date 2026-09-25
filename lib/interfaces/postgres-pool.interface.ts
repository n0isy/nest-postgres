import { Pool, PoolClient } from 'pg';

export type PostgresTransactionCallback<T> = (
  client: PoolClient,
) => T | Promise<T>;

export interface PostgresPool extends Pool {
  transaction<T>(callback: PostgresTransactionCallback<T>): Promise<T>;
}
