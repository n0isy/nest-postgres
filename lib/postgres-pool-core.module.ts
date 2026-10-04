import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';
import { getPoolToken, handleRetry } from './common/postgres.utils';
import {
  DEFAULT_CONNECTION_NAME,
  POSTGRES_POOL_MODULE_OPTIONS,
} from './postgres.constants';
import {
  PostgresModuleAsyncOptions,
  PostgresModuleOptions,
  PostgresOptionsFactory,
} from './interfaces';
import { ModuleRef } from '@nestjs/core';
import { defer, lastValueFrom } from 'rxjs';
import { TransactionalPostgresPool } from './common/postgres.pool';
import { PostgresPool } from './interfaces/postgres-pool.interface';

@Global()
@Module({})
export class PostgresPoolCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(POSTGRES_POOL_MODULE_OPTIONS)
    private readonly options: PostgresModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(
    options: PostgresModuleOptions,
    connection?: string,
  ): DynamicModule {
    const connectionName = this.getConnectionName(options, connection);
    const postgresModuleOptions = this.createPostgresModuleOptions(
      options,
      connectionName,
    );
    const postgresPoolModuleOptions = {
      provide: POSTGRES_POOL_MODULE_OPTIONS,
      useValue: postgresModuleOptions,
    };

    const connectionProvider = {
      provide: getPoolToken(connectionName),
      useFactory: async () =>
        await this.createConnectionFactory(postgresModuleOptions),
    };

    return {
      module: PostgresPoolCoreModule,
      providers: [connectionProvider, postgresPoolModuleOptions],
      exports: [connectionProvider],
    };
  }

  static forRootAsync(
    options: PostgresModuleAsyncOptions,
    connection?: string,
  ): DynamicModule {
    const connectionName = this.getConnectionName(options, connection);
    const connectionProvider = {
      provide: getPoolToken(connectionName),
      useFactory: async (options: PostgresModuleOptions) => {
        return await this.createConnectionFactory(options);
      },
      inject: [POSTGRES_POOL_MODULE_OPTIONS],
    };

    return {
      module: PostgresPoolCoreModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options, connectionName),
        connectionProvider,
      ],
      exports: [connectionProvider],
    };
  }

  async onApplicationShutdown() {
    const pool = this.moduleRef.get<PostgresPool>(getPoolToken(this.options), {
      strict: false,
    });
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
  }

  static createAsyncProviders(
    options: PostgresModuleAsyncOptions,
    connection?: string,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options, connection)];
    }
    const useClass = options.useClass as Type<PostgresOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options, connection),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  static createAsyncOptionsProvider(
    options: PostgresModuleAsyncOptions,
    connection?: string,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: POSTGRES_POOL_MODULE_OPTIONS,
        useFactory: async (...args: any[]) => {
          const postgresOptions = await options.useFactory(...args);
          return this.createPostgresModuleOptions(postgresOptions, connection);
        },
        inject: options.inject || [],
      };
    }

    // `as Type<PostgresOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<PostgresOptionsFactory>,
    ];

    return {
      provide: POSTGRES_POOL_MODULE_OPTIONS,
      useFactory: async (optionsFactory: PostgresOptionsFactory) => {
        const postgresOptions = await optionsFactory.createPostgresOptions();
        return this.createPostgresModuleOptions(postgresOptions, connection);
      },
      inject,
    };
  }

  private static async createConnectionFactory(options: PostgresModuleOptions) {
    return lastValueFrom(
      defer(() => {
        return Promise.resolve(new TransactionalPostgresPool(options));
      }).pipe(handleRetry(options.retryAttempts, options.retryDelay)),
    );
  }

  private static createPostgresModuleOptions(
    options: PostgresModuleOptions,
    connection?: string,
  ): PostgresModuleOptions {
    return {
      ...options,
      name: connection || options.name || DEFAULT_CONNECTION_NAME,
    };
  }

  private static getConnectionName(
    options: { name?: string },
    connection?: string,
  ): string {
    return connection || options.name || DEFAULT_CONNECTION_NAME;
  }
}
