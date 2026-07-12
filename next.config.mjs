/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static-first: SEO pages are statically generated at build time.
  // We keep the default output so serverless functions (feedback webhook proxy)
  // still work on Vercel's free tier.
  eslint: {
    // Type-safety is enforced via `tsc`/`next`'s type check; we don't ship an
    // ESLint config for v1, so skip the lint pass during builds.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
