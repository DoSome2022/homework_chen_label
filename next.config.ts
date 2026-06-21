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

// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 阿里雲 OSS (HTTPS)
      {
        protocol: 'https',
        hostname: 'testoss-img-pan.oss-cn-hongkong.aliyuncs.com',
        pathname: '/**',
      },
      // 阿里雲 OSS (HTTP)
      {
        protocol: 'http',
        hostname: 'testoss-img-pan.oss-cn-hongkong.aliyuncs.com',
        pathname: '/**',
      },
      // YouTube 縮圖
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
  
  // 保留 Server Action 設定
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  // ✅ 新增：告訴 Next.js 這些是服務器專用的套件
  serverExternalPackages: [
    'twilio',
    'nodemailer',
    'ali-oss',
    'urllib',
    'any-promise',
    'https-proxy-agent',
  ],

  // ✅ 新增：Webpack 配置，解決客戶端構建時的問題
  webpack: (config, { isServer }) => {
    // 只在客戶端構建時處理
    if (!isServer) {
      // 告訴 Webpack 這些模組在客戶端不需要被解析
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        os: false,
        path: false,
        zlib: false,
        child_process: false,
        // 其他可能用到的 Node.js 模組
        buffer: false,
        util: false,
        url: false,
        querystring: false,
        assert: false,
        events: false,
        process: false,
        dns: false, 
      };
    }

    // ✅ 忽略這些模組的類型檢查（可選）
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    config.module.unknownContextCritical = false;

    return config;
  },
};

export default nextConfig;