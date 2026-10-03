import { Inject } from '@nestjs/common';
import { getConnectionToken, getPoolToken } from './postgres.utils';
import { PostgresModuleOptions } from '../interfaces/postgres-options.interface';

export const InjectClient = (
  connection?: string,
): PropertyDecorator & ParameterDecorator => {
  return Inject(getConnectionToken(connection));
};

export const InjectPool = (
  connection?: string,
): PropertyDecorator & ParameterDecorator => {
  return Inject(getPoolToken(connection));
};

export const InjectConnection = (
  connection?: PostgresModuleOptions | string,
): ParameterDecorator => Inject(getConnectionToken(connection));
