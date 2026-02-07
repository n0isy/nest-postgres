# Migration from `nest-postgres` to `@n0isy/nest-postgres`

This package is a fork of [nest-postgres](https://github.com/tony133/nestjs-postgres) by [Tony133](https://github.com/Tony133).

The original author dropped the TypeScript source code from the repository, publishing only compiled JavaScript output. This fork restores the full TypeScript source (`lib/`) by reverse-engineering it from the compiled `dist/` files using [Claude Code](https://claude.ai/claude-code). All e2e tests pass against the restored source.

## What changed

- Package renamed from `nest-postgres` to `@n0isy/nest-postgres`
- TypeScript source code (`lib/`) restored from compiled `dist/` output
- `tsconfig.json` recreated (was missing from the original repo)
- Docker Compose test config pinned to `postgres:16` (compatibility with Postgres 18+ volume layout)

## Migration steps

### 1. Replace the package

```bash
npm uninstall nest-postgres
npm install @n0isy/nest-postgres
```

### 2. Update imports

Replace all imports from `nest-postgres` to `@n0isy/nest-postgres`:

```diff
- import { PostgresModule } from 'nest-postgres';
+ import { PostgresModule } from '@n0isy/nest-postgres';

- import { InjectClient } from 'nest-postgres';
+ import { InjectClient } from '@n0isy/nest-postgres';

- import { InjectPool } from 'nest-postgres';
+ import { InjectPool } from '@n0isy/nest-postgres';

- import { InjectConnection } from 'nest-postgres';
+ import { InjectConnection } from '@n0isy/nest-postgres';
```

### 3. No API changes

The public API is identical. No code changes are needed beyond updating the import paths.

## Compatibility

| Dependency | Supported versions |
|---|---|
| `@nestjs/common` | ^9.0.0 \|\| ^10.0.0 \|\| ^11.0.0 |
| `@nestjs/core` | ^9.0.0 \|\| ^10.0.0 \|\| ^11.0.0 |
| `pg` | ^8.7.3 |
| `rxjs` | ^6.6.3 \|\| ^7.2.0 |
| `reflect-metadata` | ^0.1.13 \|\| ^0.2.0 |
