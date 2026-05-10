// // ./next.config.ts
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'testoss-img-pan.oss-cn-hongkong.aliyuncs.com',
//       },
//       {
//         protocol: 'http',
//         hostname: 'testoss-img-pan.oss-cn-hongkong.aliyuncs.com',
//       },
//     ],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 你確認正確的阿里雲設定 (HTTPS)
      {
        protocol: 'https',
        hostname: 'testoss-img-pan.oss-cn-hongkong.aliyuncs.com',
        pathname: '/**', // 建議加上這個，允許該域名下的所有路徑
      },
      // 你確認正確的阿里雲設定 (HTTP)
      {
        protocol: 'http',
        hostname: 'testoss-img-pan.oss-cn-hongkong.aliyuncs.com',
        pathname: '/**',
      },
      // 👇 如果你需要顯示 YouTube 縮圖，必須加這兩段 👇
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
    ],
  },
  // 保留你原本需要的 Server Action 設定
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
