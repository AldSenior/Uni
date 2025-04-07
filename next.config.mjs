// next.config.mjs
import { withContentSecurityPolicy } from "next-content-security-policy";

const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' https://trustedscripts.example.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  frame-ancestors 'self' https://vk.com https://*.vk.com;
`.replace(/\n/g, "");

export default withContentSecurityPolicy({
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)", // применяем для всех маршрутов
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
});
