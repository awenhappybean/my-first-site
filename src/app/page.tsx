import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const in7d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [contactCount, meetingCount, pendingSummaryCount, upcomingBookings, recentMeetings] =
    await Promise.all([
      prisma.contact.count(),
      prisma.meeting.count(),
      prisma.meeting.count({ where: { summaryStatus: { in: ["NONE", "PENDING"] } } }),
      prisma.booking.findMany({
        where: { scheduledAt: { gte: new Date(), lte: in7d } },
        include: { contact: true },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
      prisma.meeting.findMany({
        include: { contact: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    { label: "聯絡人總數", value: contactCount, href: "/contacts" },
    { label: "一對一紀錄", value: meetingCount, href: "/meetings" },
    { label: "待處理摘要", value: pendingSummaryCount, href: "/meetings" },
    { label: "7 天內預約", value: upcomingBookings.length, href: "/calendar" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--navy)]">總覽</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          BNI 華冠分會通訊錄、預約與一對一摘要管理
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition-colors hover:border-[var(--blue)]">
            <p className="text-sm text-[var(--muted)]">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-[var(--navy)]">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--navy)]">近期預約</h2>
            <Link href="/calendar" className="text-sm text-[var(--blue)] hover:underline">
              查看全部
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">7 天內沒有預約</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcomingBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-sm">
                  <span>{b.contact.name}</span>
                  <span className="text-[var(--muted)]">
                    {b.scheduledAt.toLocaleString("zh-TW", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--navy)]">最新一對一紀錄</h2>
            <Link href="/meetings" className="text-sm text-[var(--blue)] hover:underline">
              查看全部
            </Link>
          </div>
          {recentMeetings.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">尚無紀錄</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentMeetings.map((m) => (
                <li key={m.id}>
                  <Link href={`/meetings/${m.id}`} className="flex items-center justify-between text-sm text-[var(--blue)] hover:underline">
                    <span>{m.contact.name}</span>
                    <span className="text-[var(--muted)]">
                      {m.createdAt.toLocaleDateString("zh-TW")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-[var(--orange)] p-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--navy)]">分享預約連結</h2>
          <p className="text-sm text-[var(--muted)]">將此連結分享給夥伴，讓對方自行預約一對一時間</p>
        </div>
        <Link href="/book" className="btn-accent">
          前往預約頁面
        </Link>
      </div>
    </div>
  );
}
