import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const nextConfigDir = dirname(fileURLToPath(import.meta.url));

// Routes whose code imports sharp (through the media service).
const SHARP_ROUTES = ['/api/media', '/api/media/[id]', '/api/verification/me', '/api/admin/verifications', '/api/admin/verifications/[id]'];

// sharp's native addon loads libvips by file path, so build tracing never sees it and the serverless
// function ships without it ("libvips-cpp.so... cannot open shared object file"). Copy it in explicitly.
const SHARP_NATIVE_FILES = ['./node_modules/@img/sharp-libvips-*/lib/**/*', './node_modules/@img/sharp-*/lib/**/*'];

const nextConfig: NextConfig = {
  turbopack: {
    root: nextConfigDir,
  },
  outputFileTracingIncludes: Object.fromEntries(SHARP_ROUTES.map((route) => [route, SHARP_NATIVE_FILES])),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
