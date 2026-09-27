import { NextResponse } from "next/server";
import { getNotificationsForClient, markNotificationRead } from "@/lib/serverStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId") || undefined;
    const clientEmail = searchParams.get("clientEmail") || undefined;
    const notifs = getNotificationsForClient(clientId, clientEmail);
    return NextResponse.json({ notifications: notifs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { notificationId } = await req.json();
    if (notificationId) {
      markNotificationRead(notificationId);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
