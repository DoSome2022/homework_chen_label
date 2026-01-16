// ./next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'testoss-img-pan.oss-cn-hongkong.aliyuncs.com',
      },
      {
        protocol: 'http',
        hostname: 'testoss-img-pan.oss-cn-hongkong.aliyuncs.com',
      },
    ],
  },
};

export default nextConfig;