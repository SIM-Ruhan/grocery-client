const api = (process.env.API_ORIGIN || "http://localhost:8000").replace(
  /\/$/,
  "",
);
export default {
  async rewrites() {
    return [{ source: "/api/:path*", destination: api + "/api/:path*" }];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};
