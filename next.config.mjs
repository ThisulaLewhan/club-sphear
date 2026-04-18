/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["jsonwebtoken"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.transparenttextures.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

