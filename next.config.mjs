/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  // Nécessaire pour Cloudinary/Turso sur Vercel
  serverExternalPackages: ['@libsql/client'],
};

export default nextConfig;
