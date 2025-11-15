# Next.js App Router

## Setup

- Next 16+ uses Turbopack by default. To opt-out, use the `--webpack` option on `dev` and `build` commands.
- Much **boundaries**, streaming, and serverless. 2 opposing modes: parts of a route can be in a functioning and non-functioning state. And in a loading or resolved state. And in a static or dynamic state. All without blocking the rest of the page. Imo there are more important things than caching.
- Next 16 finally fixes the "magic"/confusing fetch-based caching from the "classic" App Router and makes caching explicit and optional.

## Inside the `app` directory

- **Layout components** expose a shared UI (eg. header, nav, or footer) child component, `loading` for suspense boundary, or `error` for error boundary.
  - `app/layout.tsx` is the **root layout**, and must contain `<html>` and `<body>` tags. You get a runtime error if you don't.
  - Don't add `<head>` tags to root layouts, export a `metadata` object instead.
  - Fun fact: `next dev` allegedly checks whether `app/layout.tsx` is missing, and scaffolds it for you.
  - `app/layout.tsx` wraps all routes. `app/blog/layout.tsx` wraps /blog and descendants.
  - Advanced: `app/(shop)/cart/page.tsx` shares the layouts within (shop)
- **Page components** expose a public routes and children of layouts.
  - `app/page.tsx` is the root page.
  - `app/blog/_components/Post.tsx` is not routable, and is a safe place for UI utilities
- Both layout and page components are **React Server Components** by default
- **Route components** expose an API endpoint.
  - The following async function names are supported: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.
  - Fun fact: If `OPTIONS` is not defined, Next.js will automatically implement it, since it's important for pre-flight.
- **Routing-aware components** are a smart import that selects the right component based on URL. Think URL-driven instead of state-driven.
  - **Parallel routes** (`@folder`) are for when you need non-blocking loading/error states for UI **slots**, so sidebar.tsx doesn't block main-content.tsx. Very niche optimization.
  - **Intercepted routes** (`(.)folder`) are for when you want different UI (modal vs full page) based on how you got there, while keeping URLs shareable and SEO-friendly.
  - Twitter/X does this: Click tweet from feed -> modal (intercepted route). Share x.com/123 -> full page.
- `components` and `lib`/`util` directories have no special effect.

## Server and Client Components

Next.js uses the following render hierarchy:

1. layout.js
2. template.js, error.js, loading.js, not-found.js
3. page.js or nested layout.js

- **Static Rendering** (or **prerendering**) occurs during build time or revalidation. Contest is already available client-side, so makes navigation feel instant.
  - The **Link component** (`<Link>`) allows client-side transitions, but prefetching when hovered or entering the viewport
  - Good resource for animated loading bar: https://github.com/vercel/react-transition-progress
- **Dynamic Rendering** occurs at request time.
  - Partial prefetching is possible with **streaming**. To use streaming, create `loading.tsx` or use a shared layout. This allows the server to send each part of a dynamic route as they're ready.
  - `loading.tsx` automatically wraps `page.tsx` in a `<Suspense>` component
  - Core Web Vitals go brrrrr!
- `next dev` displays if a route is static or dynamic
- `generateStaticParams` is the new `getStaticProps`
- Next.js uses React's APIs to orchestrate rendering:
- **Client Components** run in the browser, and handle interactivity. Use these when you need `onClick`, `useEffect`, or the `window` object.
  - Simply add the `"use client"` directive to the top of a file to declare a boundary
  - All its imports and child components are considered part of the client bundle. That is, you don't need to add the directive to every child component
  - Fun fact: the React `use` hook also turns a server compoennt into a client component
- **Server Components** render on the server, and **never ship to the browser**. Useful for making API calls with API keys, and reducing the browser bundle
  - Server renders a **RSC payload**, a compact binary representation of the component tree, with **placeholders** for client components and any **props passed** to client components.
  - If env variables are not prefixed with `NEXT_PUBLIC_`, they are replaced with an empty string.
  - To prevent accidental usage, use `import 'server-only'`. The corresponding `client-only` npm package can be used too. Fun fact: the contents of these packages from npm are not used by Next.js.
  - React context is NOT supported in server components
- Next.js uses React's APIs to orchestrate rendering

On page load:

1. Server compiles server components into an RSC payload binary
2. Client uses HTML for the first paint
3. Client uses RSC payload to know what the UI should look like
4. Client uses JavaScript to hydrate client components and attach event handlers

On navigation, navigation can be fully satisfied from the client cache.

A lot of this shit when usign npm packages:

```
'use client'

import { Carousel } from 'cool-carousel'

export default Carousel
```

- **Partial Prerendering (PPR)** allows you to optimize the **parts of the page that don't change** as **pre-rendered shells**. You can make a page as static or dynamic as it needs to be.
- **Cache components** flips the script. As of Next 16 and React 19.2, when enabled, Next.js treats everything as dynamic by default. No implicit caching. And you need to manually mark data and components as cacheable with `use cache` or React's `cache()`. Enable with `cacheComponents: true` in `next.config.ts`.
  - This is the stable form of `unstable_cache` that took an async function, array, and object as arguments (wtf?).
  - Equivalent to `export const dynamic = 'force-dynamic'` on page components.
  - And `'use cache'` is the new `export const dynamic = 'force-static'`
  - The `use cache` directive caching can be applied to all IO if the data changes infrequently (eg. database calls, API calls), not just components and routes!
- Fully dynamic pages can still steam and send early asset hints (eg. `<link>`) about what it'll need.
- With Cache Components enabled, Next.js enforces that **dynamic code must be wrapped in a parent `<Suspense>` boundary or moved into a Cache Component (`'use cache'`)**, because Next refuses to let uncached async work block the whole route.
  - Otherwise, you get a "Uncached data was accessed outside of <Suspense>" error
- Fun fact: Wrapping a component in `<Suspense>` doesn't make it dynamic - calling an API does. Suspense just acts as a boundary that enables streaming. This allows Next.js to stream its contents to the user as soon as it's ready, without blocking the rest of the app.
- For expensive-but-slowly-changing queries (eg. CMS), use `cacheTag` to tag your cached data, then trigger `updateTag` or `revalidateTag` to mark the UI as ready for revalidation.
- Behind the scenes, `loading.tsx` will be nested inside `layout.tsx`, and automatically wrap `page.tsx` in a `<Suspense>` boundary. This is good if you don't want cumulative shift and want to show a full screen loading state immediately. For more granular streaming, you can use `<Suspense>` inside `page.tsx`
- That's very close to our getServerSideProps mental model, but with streaming + nested layouts. A little more digestable than the "classic" App router with `cacheComponents: false`. If you later decide "this part is okay to cache", you just opt it in. Cool!
- If you prop drill `{children}`, child components remain dynamic!

```tsx
// Query the database at most once per hour
import { cacheLife } from "next/cache";

export async function GET() {
  const products = await getProducts();

  return Response.json(products);
}

async function getProducts() {
  "use cache";
  cacheLife("hours");

  return await db.query("SELECT * FROM products");
}
```

## Biome

- ESLint and Prettier finally have some real competition.
- Prettier funded their own competition, since they are nearly **feature complete**. A USD$20,000 bounty was put up by Prettier to create a Rust-based formatter that passed 95% of Prettier's unit tests for JavaScript, essentially a faster, drop-in equivalent. ($10,000 contributed by Vercel) Biome already existed, but as a Rust fork of Rome it pursued Prettier-compatibility, hit the target (97%, 25x faster than Prettier, 15x faster than ESLint), and ended up winning.
- I love that JS/TS tooling is getting rewritten in Rust
- Rust can't spinup `tsc` so it's an uphill battle. No ESLint spam in your `package.json`. But it's missing the ESLint plugin system is a bit of a hit, especially Tailwind shorthand and utils ordering support.

```sh
# Add `.vscode/extensions.json` and `.vscode/settings.json`

pnpm add -D -E @biomejs/biome
pnpx @biomejs/biome init
pnpm lint
pnpm format

# Sub-2ms!!
# Formatted 12 files in 1993µs
```

- If one request fails when using `Promise.all`, the **entire operation will fail**. To handle this, you can use `Promise.allSettled`.

## React Compiler

- The React Compiler enables an extra optimization layer that automatically memoizes React components via a Babel plugin orchestrated by the Rust-based SWC compiler. No `useMemo`, or `useCallback` needed!
- Next still uses SWC as the main compiler, but invoke that Babel plugin so you may notice slightly longer build times. You only opt-out of SWC altogether when a `.babelrc` or `babel.config.js` is present.
- The `'use memo'` directive can be enabled by adding `reactCompiler: { compilationMode: 'annotation' }` to your `next.config.ts`
- I'm not sure why you'd want to do this, but the `'use no memo'` directive can be used to opt-out of React Compiler transforms.

```
pnpm install -D babel-plugin-react-compiler
```

## Wtfs to look into later

- https://nextjs.org/docs/app/getting-started/fetching-data#preloading-data
