import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const embedUrl = process.env.GOOGLE_CALENDAR_EMBED_URL;

  const bookings = await prisma.booking.findMany({
    where: { scheduledAt: { gte: new Date() } },
    include: { contact: true },
    orderBy: { scheduledAt: "asc" },
    take: 20,
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--navy)]">Google 日曆</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          查看分會行程與即將到來的一對一預約
        </p>
      </div>

      <div className="card p-5">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="h-[600px] w-full rounded-lg border border-[var(--border)]"
            style={{ border: 0 }}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            尚未設定 Google 日曆嵌入網址。請在 Google 日曆「設定與共用」中取得嵌入程式碼的網址，
            填入環境變數 <code className="rounded bg-[var(--blue-light)] px-1">GOOGLE_CALENDAR_EMBED_URL</code>。
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">即將到來的一對一預約</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">目前沒有即將到來的預約</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] px-4 py-3 text-sm"
              >
                <div>
                  <Link href={`/contacts/${b.contactId}`} className="font-medium text-[var(--blue)] hover:underline">
                    {b.contact.name}
                  </Link>
                  {b.location && <span className="ml-2 text-[var(--muted)]">＠{b.location}</span>}
                </div>
                <span className="text-[var(--muted)]">
                  {b.scheduledAt.toLocaleString("zh-TW", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
