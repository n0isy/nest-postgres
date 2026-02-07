import { Inject } from '@nestjs/common';
import { getConnectionToken } from './postgres.utils';
import { PostgresModuleOptions } from '../interfaces/postgres-options.interface';

export const InjectClient = (
  connection?: string,
): PropertyDecorator & ParameterDecorator => {
  return Inject(getConnectionToken(connection));
};

export const InjectPool = (
  connection?: string,
): PropertyDecorator & ParameterDecorator => {
  return Inject(getConnectionToken(connection));
};

export const InjectConnection = (
  connection?: PostgresModuleOptions | string,
): ParameterDecorator => Inject(getConnectionToken(connection));
