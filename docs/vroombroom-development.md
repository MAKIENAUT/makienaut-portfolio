# VroomBroom development environment

VroomBroom development uses the separate `orb-weaver-dev-db` Prisma Postgres
resource in Vercel. It is connected only to the Vercel Development environment
and does not connect to the Preview or Production database.

## First-time setup

```bash
npm run dev:setup
npm run dev
```

Open:

- Site: `http://localhost:3000/vroombroom`
- Backoffice: `http://localhost:3000/vroombroom/backoffice`
- Customer orders: `http://localhost:3000/vroombroom/orders`

`dev:setup` pulls the Vercel Development variables into the gitignored
`.env.local`, deploys all committed migrations to the development database, and
regenerates Prisma Client.

## Database commands

```bash
npm run env:dev:pull
npm run db:deploy
npm run db:status
npm run db:studio
```

The database credentials and development-only backoffice secrets are managed
in the Vercel Development environment and pulled into `.env.local`.

## Environment separation

- Local development prefers `ORBW_DEV_DATABASE_URL`.
- `orb-weaver-dev-db` is scoped only to Vercel Development.
- `orb-weaver-main-db` remains the deployed database.
- Preview and Production use `OW_MAIN_DB_DATABASE_URL` or the existing deployed
  Prisma Postgres variables.
- Bangus catalog and orders prefer `OW_MAIN_DB_DATABASE_URL`. When a local
  environment contains a redacted or invalid main connection value, they fall
  back to `ORBW_DEV_DATABASE_URL` so the back office remains usable.
- Use different `ORBW_AUTH_SECRET` values for Development, Preview, and
  Production. Back-office users are stored in their respective databases; run
  `npm run auth:admin:create` after deploying migrations to create or reset an
  administrator account.

To reset the development administrator password, run `npm run auth:admin:create`
after `npm run db:deploy`. The command updates the matching database record and
does not store the password in Vercel environment variables.
