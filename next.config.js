/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

const withPWA = require('next-pwa')({
    dest: 'public',
    disable: isDev,
});

const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });

        return config;
    },
};

module.exports = withPWA(nextConfig);
