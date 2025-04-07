import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    // Получаем access_token от VK
    const tokenResponse = await axios.get("https://oauth.vk.com/access_token", {
      params: {
        client_id: 53263292,
        client_secret: "xK4loxyZGbRjhC7OjBw2",
        redirect_uri: "https://www.unimessage.ru/api/vk/callback",
        code,
      },
    });

    const { access_token, user_id } = tokenResponse.data;

    // Формируем HTML для сохранения токена
    const html = `
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'vk-auth-success',
              token: '${access_token}',
              userId: ${user_id}
            }, '*')
            window.close()
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return NextResponse.redirect("/auth/error");
  }
}
