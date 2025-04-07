// app/api/vk/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);

    // Получаем параметры из URL
    const code = url.searchParams.get("code");
    const device_id = url.searchParams.get("device_id");
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(`/auth/error?reason=${error}`);
    }

    if (!code) {
      return NextResponse.redirect("/auth/error?reason=missing_code");
    }

    // Сохраняем параметры в localStorage через клиентский редирект
    const redirectUrl = new URL("/auth/handler", url.origin);
    redirectUrl.searchParams.set("code", code);
    if (device_id) redirectUrl.searchParams.set("device_id", device_id);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect("/auth/error?reason=internal_error");
  }
}
