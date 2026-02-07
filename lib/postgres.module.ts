import { DynamicModule, Module } from '@nestjs/common';
import { PostgresModuleAsyncOptions, PostgresModuleOptions } from './interfaces';
import { PostgresCoreModule } from './postgres-core.module';

@Module({})
export class PostgresModule {
  static forRoot(
    options: PostgresModuleOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: PostgresModule,
      imports: [PostgresCoreModule.forRoot(options, connection)],
    };
  }

  static forRootAsync(
    options: PostgresModuleAsyncOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: PostgresModule,
      imports: [PostgresCoreModule.forRootAsync(options, connection)],
    };
  }
}
