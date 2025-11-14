# Next.js App Router

## Setup

- Next 16+ uses Turbopack by default. To opt-out, use the `--webpack` option on `dev` and `build` commands.

## Inside the `app` directory


- **Layout components** expose a shared UI (eg. header, nav, or footer) child component, `loading` for skeleton, or `error` for error boundaries.
    - `app/layout.tsx` is the **root layout**, and must contain `<html>` and `<body>` tags. You get a runtime error if you don't.
    - Don't add `<head>` tags to root layouts, export a `metadata` object instead.
    - Fun fact: `next dev` allegedly checks whether `app/layout.tsx` is missing, and scaffolds it for you.
    - `app/layout.tsx` wraps all routes. `app/blog/layout.tsx` wraps /blog and descendants.
    - Advanced: `app/(shop)/cart/page.tsx` shares the layouts within (shop)
- **Page components** expose a public routes and children of layouts. 
    - `app/page.tsx` is the root page.
    - `app/blog/_components/Post.tsx` is not routable, and is a safe place for UI utilities
- **Route components** 
