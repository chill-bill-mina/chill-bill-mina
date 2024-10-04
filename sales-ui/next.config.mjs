/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media3.bsh-group.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
