// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ 啟用 Standalone 模式（減少部署檔案大小）
  output: 'standalone',
  
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
  
  // ✅ 使用 SWC 壓縮（更快、更省記憶體）
  swcMinify: true,
  
  // 保留 Server Action 設定
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // ✅ 限制並行編譯，減少記憶體使用
    workerThreads: false,
    cpus: 1,
  },

  // ✅ 告訴 Next.js 這些是服務器專用的套件
  serverExternalPackages: [
    'twilio',
    'nodemailer',
    'ali-oss',
    'urllib',
    'any-promise',
    'https-proxy-agent',
  ],

  // ✅ Webpack 配置，解決客戶端構建時的問題
  webpack: (config, { isServer }) => {
    // 只在客戶端構建時處理
    if (!isServer) {
      // 告訴 Webpack 這些模組在客戶端不需要被解析
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        os: false,
        path: false,
        zlib: false,
        child_process: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
        assert: false,
        events: false,
        process: false,
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