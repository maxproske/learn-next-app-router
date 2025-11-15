import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Extra optimization layer that automatically memoizes React components
  // via a Babel plugin orchestrated by the Rust-based SWC compiler.
  // No `useMemo`, or `useCallback` needed!
  reactCompiler: true,
  // Expected to be used with the `use cache` directive to create Cache Components.
  cacheComponents: true,
}

export default nextConfig
