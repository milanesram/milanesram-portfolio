/**
 * Vitest stand-in for the `server-only` package.
 *
 * Next.js production/client builds still use the real package. Tests need this
 * stub so server-only IndexNow modules can be imported without a bundler.
 */
export {};
