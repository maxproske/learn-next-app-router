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
- Render hierarchy:
```
layout.js
template.js
error.js
loading.js
not-found.js
page.js or nested layout.js
```

- components and lib folders