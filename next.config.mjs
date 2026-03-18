import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-globe.gl", "three", "globe.gl"],
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
