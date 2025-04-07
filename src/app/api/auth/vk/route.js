import { NextResponse } from "next/server";
import axios from "axios";

const CLIENT_ID = process.env.VK_CLIENT_ID || "53263292";
const CLIENT_SECRET = process.env.VK_CLIENT_SECRET || "xK4loxyZGbRjhC7OjBw2";
const REDIRECT_URI =
  process.env.VK_REDIRECT_URI || "https://www.unimessage.ru/messages";

export async function POST(request) {
  try {
    const { code, device_id } = await request.json();

    // Обмениваем код на токен через VK API
    const response = await axios.get("https://oauth.vk.com/access_token", {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      },
    });

    const responseData = response.data;

    if (responseData.error) {
      return NextResponse.json(
        { success: false, error: responseData.error },
        { status: 400 },
      );
    }

    // Создаем ответ с установкой httpOnly куки
    const nextResponse = NextResponse.json(
      { success: true, data: responseData },
      { status: 200 },
    );

    nextResponse.cookies.set({
      name: "vk_access_token",
      value: responseData.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: responseData.expires_in || 86400,
      path: "/",
    });

    return nextResponse;
  } catch (error) {
    console.error("Error in VK auth:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
