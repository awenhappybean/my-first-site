import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // 未設定則不保護（僅建議本機測試用）

  const header = request.headers.get("authorization");
  const query = request.nextUrl.searchParams.get("secret");
  return header === `Bearer ${secret}` || query === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      scheduledAt: { gte: new Date(), lte: in24h },
      reminderSentAt: null,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: { contact: true },
  });

  let sent = 0;
  for (const booking of bookings) {
    if (!booking.contact.email) continue;

    const scheduledLabel = booking.scheduledAt.toLocaleString("zh-TW", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    await sendMail({
      to: booking.contact.email,
      subject: `【提醒】您與 BNI 華冠分會的一對一即將於 ${scheduledLabel} 開始`,
      html: `<p>您好 ${booking.contact.name}，提醒您明日的一對一會談時間為 <b>${scheduledLabel}</b>。</p>
             ${booking.location ? `<p>地點：${booking.location}</p>` : ""}`,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { reminderSentAt: new Date() },
    });
    sent += 1;
  }

  return NextResponse.json({ ok: true, checked: bookings.length, sent });
}
