import { withPigment } from "@pigment-css/nextjs-plugin";
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    },
};

export default withPigment(nextConfig);
