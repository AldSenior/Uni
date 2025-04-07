import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const { code, device_id } = await request.json();

    // Валидация параметров
    if (!code || !device_id) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    // Обмен кода на токен
    const response = await axios.get("https://oauth.vk.com/access_token", {
      params: {
        client_id: 53263292,
        client_secret: "xK4loxyZGbRjhC7OjBw2",
        code,
        device_id,
        redirect_uri: "https://www.unimessage.ru/profile",
      },
    });

    return NextResponse.json({
      success: true,
      token: response.data.access_token,
      user_id: response.data.user_id,
    });
  } catch (error) {
    console.error("Exchange error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: "exchange_failed",
        details: error.response?.data || { message: error.message },
      },
      { status: 500 },
    );
  }
}
// 7. Настройка CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://www.unimessage.ru",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
