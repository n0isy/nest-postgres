import { Client, PoolConfig } from 'pg';

export interface PostgresModuleOptions extends PoolConfig {
  name?: string;
  clientOptions?: Client;
  retryAttempts?: number;
  retryDelay?: number;
  waitForConnections?: boolean;
  statementTimeout?: number;
  queryTimeout?: number;
  applicationName?: string;
  idleInTransactionSessionTimeout?: number;
}
