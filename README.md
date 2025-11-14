# Next.js App Router

## Setup

- Next 16+ uses Turbopack by default. To opt-out, use the `--webpack` option on `dev` and `build` commands.

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
- **Server Components** render on the server, and **never ship to the browser**. Useful for making API calls with API keys, and reducing the browser bundle
    - Server renders a **RSC payload**, a compact binary representation of the component tree, with **placeholders** for client components and any **props passed** to client components.
- Next.js uses React's APIs to orchestrate rendering

On page load:
1. Server compiles server components into an RSC payload binary
2. Client uses HTML for the first paint
3. Client uses RSC payload to know what the UI should look like
4. Client uses JavaScript to hydrate client components and attach event handlers

On navigation, navigation can be fully satisfied from the client cache.
