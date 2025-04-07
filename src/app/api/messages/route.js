import { NextResponse } from "next/server";
import easyvk from "easyvk";

export async function GET(request) {
  try {
    const token = request.cookies.get("vk_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vk = await easyvk({ access_token: token });

    const conversations = await vk.call("messages.getConversations", {
      count: 20,
      extended: 1,
    });

    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
