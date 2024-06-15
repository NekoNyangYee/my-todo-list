/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public',
});

const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    },
};

module.exports = withPWA(nextConfig);