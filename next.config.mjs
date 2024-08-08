import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dev.validatorinfo.com', 's3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dev.validatorinfo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'votingpower.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
