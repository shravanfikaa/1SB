const { i18n } = require('./next-i18next.config');
const appConfig = require('./app.config');

const nextConfig = {
  reactStrictMode: true,
  env: appConfig.headers, //Pass environment variables from appConfig
  async headers() {
    return [
      {
        source: '/(.*)?',
        headers: [
          { key: 'X-Frame-Options', value: appConfig.headers.xFrameOptions },
          { key: 'X-XSS-Protection', value: appConfig.headers.xssProtection },
          { key: 'Content-Security-Policy', value: appConfig.headers.contentSecurityPolicy },
          { key: 'X-Content-Type-Options', value: appConfig.headers.contentTypeOptions },
          { key: 'Strict-Transport-Security', value: appConfig.headers.strictTransportSecurity },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '1sb-manufacturer-logos.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fixed-deposit-documents-dev.s3-ap-south-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '1sb-artifacts.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  i18n,
};

module.exports = nextConfig;
