/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Render's fromService hostport gives "host:port" with no scheme — prepend http://.
    const raw = process.env.BACKEND_URL ?? "http://localhost:8000";
    const backendUrl = raw.startsWith("http") ? raw : `http://${raw}`;
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
