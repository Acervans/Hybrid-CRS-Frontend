# Hybrid-CRS-Frontend
Frontend for [Hybrid-CRS](https://github.com/Acervans/Hybrid-CRS), developed with Next.js framework

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Folder Structure
The Next.js app is located inside `hybrid-crs-ui/`, with the following folder structure:
- **/src** -> All the source code that will be compiled and rendered by Next.js
  - **/app** -> Application routes and pages
  - **/components** -> Custom React components
  - **/contexts** -> Data Contexts shared among Components
  - **/hooks** -> Custom hooks for shared stateful logic
  - **/i18n** -> Request configuration for i18n (Internationalisation)
  - **/lib** -> Backend API and database configuration, Server Actions
  - **/views** -> Page views, composed of whole screens or sections
  - `constants.ts` -> Shared constants definitions
  - `types.ts` -> Type/Interface definitions
- **/public** -> Static assets

## Getting Started

First, run the development server inside `/hybrid-crs-ui`:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Or use Docker Compose:

```bash
docker compose up
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load the Inter font family.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
