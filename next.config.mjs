// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
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
                https://ruwf.my.games
                https://wf.my.games
                https://aa.my.games
                https://la.my.games
                https://pw.my.games
                https://bb.my.games
                https://jd.my.games
                https://parapa.my.games
                https://cfire.my.games
                https://ruro.my.games
                https://cloud.my.games
                https://store.my.games
                https://market.my.games
                https://cloud.vkplay.ru
                https://la.vkplay.ru
                https://ruwf.vkplay.ru
                https://market.vkplay.ru
                https://vkplay.ru
                https://web.vk.me
                https://*.pages-ac.vk-apps.com
                https://www.unimessage.ru/
            `
              .replace(/\n/g, " ")
              .replace(/\s+/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
