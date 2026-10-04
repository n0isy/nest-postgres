import { DynamicModule, Module } from '@nestjs/common';
import {
  PostgresModuleAsyncOptions,
  PostgresModuleOptions,
} from './interfaces';
import { PostgresPoolCoreModule } from './postgres-pool-core.module';

@Module({})
export class PostgresPoolModule {
  static forRoot(
    options: PostgresModuleOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: PostgresPoolModule,
      imports: [PostgresPoolCoreModule.forRoot(options, connection)],
    };
  }

  static forRootAsync(
    options: PostgresModuleAsyncOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: PostgresPoolModule,
      imports: [PostgresPoolCoreModule.forRootAsync(options, connection)],
    };
  }
}
