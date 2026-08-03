This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## VroomBroom

The helmet-cleaning experience is available at:

- Landing page: `/vroombroom`
- Customer order tracking: `/vroombroom/orders`
- Private back-office: `/vroombroom/backoffice`

Copy `.env.example` to `.env.local`, then add the Vercel Prisma Postgres
credentials and back-office session secret. The local file is ignored by Git.

Create or reset the database-backed `admin` back-office account:

```bash
npm run db:deploy
npm run auth:admin:create
```

The command defaults to username `admin`, prompts for a password, and saves
only an scrypt hash in the database. Run it separately in each development,
preview, or production database.

If production database credentials cannot be used from a local machine, set
`ORBW_BOOTSTRAP_ADMIN_PASSWORD` in Vercel Production, sign in once as `admin`,
then delete that environment variable. The first successful sign-in creates the
database record; future sign-ins use the database hash only.

Generate the Prisma client and apply the committed migration:

```bash
npm run db:generate
npm run db:deploy
```

For an isolated hosted development database and backoffice, see
[`docs/vroombroom-development.md`](docs/vroombroom-development.md).

Vercel uses the `vercel-build` script to generate Prisma Client, apply pending
production migrations, and build the Next.js application.
