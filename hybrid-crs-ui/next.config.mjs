import withPWAInit from "@ducanh2912/next-pwa";

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
    swcMinify: true,
    reactStrictMode: true,
};

export default withPWA(nextConfig);
