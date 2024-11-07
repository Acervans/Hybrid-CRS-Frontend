import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
    swSrc: "src/sw.ts", // Service worker
    swDest: "public/sw.js",
    reloadOnOnline: true,
    injectionPoint: "__SW_MANIFEST",
    disable: process.env.NODE_ENV === "development", // Disable PWA in development
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: true,
    reactStrictMode: true,
};

export default withSerwist(nextConfig);
