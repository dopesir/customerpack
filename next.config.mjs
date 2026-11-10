/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-lib', '@pdf-lib/fontkit'],
  },
};

export default nextConfig;
