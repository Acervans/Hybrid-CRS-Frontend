import withPWAInit from "@ducanh2912/next-pwa";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    reloadOnOnline: true,
    fallbacks: {
        document: '/~offline'
    }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    },
};

export default withPWA(withNextIntl(nextConfig));
