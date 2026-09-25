import { Test } from '@nestjs/testing';
import { Pool, PoolClient } from 'pg';
import { PostgresPoolModule } from '../../lib';
import { TransactionalPostgresPool } from '../../lib/common/postgres.pool';
import {
  getConnectionToken,
  getPoolToken,
} from '../../lib/common/postgres.utils';
import { PostgresPool } from '../../lib/interfaces/postgres-pool.interface';

describe('Postgres pool provider', () => {
  it('uses a token separate from the client provider', () => {
    expect(getPoolToken()).not.toBe(getConnectionToken());
    expect(getPoolToken('analytics')).not.toBe(
      getConnectionToken('analytics'),
    );
  });

  it('injects pg.Pool for the default connection token', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PostgresPoolModule.forRoot({})],
    }).compile();

    const pool = moduleRef.get<PostgresPool>(getPoolToken());

    expect(pool).toBeInstanceOf(Pool);
    expect(typeof pool.transaction).toBe('function');

    await moduleRef.close();
  });

  it('keeps named connection pools separated', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PostgresPoolModule.forRoot({}, 'analytics'),
        PostgresPoolModule.forRoot({}, 'events'),
      ],
    }).compile();

    const analytics = moduleRef.get<PostgresPool>(getPoolToken('analytics'));
    const events = moduleRef.get<PostgresPool>(getPoolToken('events'));

    expect(analytics).toBeInstanceOf(Pool);
    expect(events).toBeInstanceOf(Pool);
    expect(analytics).not.toBe(events);

    await moduleRef.close();
  });
});

describe('TransactionalPostgresPool', () => {
  it('commits successful transactions and releases the client', async () => {
    const pool = new TransactionalPostgresPool();
    const client = createClientMock();
    jest
      .spyOn(pool, 'connect')
      .mockImplementation(() => Promise.resolve(client));

    const result = await pool.transaction(async (transactionClient) => {
      await transactionClient.query('SELECT 1');
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(client.query).toHaveBeenNthCalledWith(2, 'SELECT 1');
    expect(client.query).toHaveBeenNthCalledWith(3, 'COMMIT');
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it('rolls back failed transactions and releases the client', async () => {
    const pool = new TransactionalPostgresPool();
    const client = createClientMock();
    const error = new Error('failed query');
    jest
      .spyOn(pool, 'connect')
      .mockImplementation(() => Promise.resolve(client));

    await expect(
      pool.transaction(async () => {
        throw error;
      }),
    ).rejects.toThrow(error);

    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(client.query).toHaveBeenNthCalledWith(2, 'ROLLBACK');
    expect(client.release).toHaveBeenCalledTimes(1);
  });
});

function createClientMock(): PoolClient {
  return {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    release: jest.fn(),
  } as unknown as PoolClient;
}
