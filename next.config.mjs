/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // Применяется ко всем страницам
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              frame-ancestors
                'self'
                https://vk.com
                https://*.vk.com
                https://vk.ru
                https://*.vk.ru
                https://web.vk.me
                https://*.pages-ac.vk-apps.com
               `
              .replace(/\s+/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
