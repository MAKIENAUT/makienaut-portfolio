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
credentials and back-office secrets. The local file is ignored by Git.

Generate a secure password hash:

```bash
npm run auth:hash
```

The command prints both `ORBW_BACKOFFICE_PASSWORD_HASH` and a new
`ORBW_AUTH_SECRET`. Add both values to `.env.local` for development and to the
Vercel project environment for production.

Generate the Prisma client and apply the committed migration:

```bash
npm run db:generate
npm run db:deploy
```

For an isolated hosted development database and backoffice, see
[`docs/vroombroom-development.md`](docs/vroombroom-development.md).

Vercel uses the `vercel-build` script to generate Prisma Client, apply pending
production migrations, and build the Next.js application.
