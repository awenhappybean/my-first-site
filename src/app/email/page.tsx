import { prisma } from "@/lib/prisma";
import { sendBroadcastEmail } from "./actions";

export const dynamic = "force-dynamic";

export default async function EmailPage({
  searchParams,
}: PageProps<"/email">) {
  const { sent } = await searchParams;

  const [contacts, logs] = await Promise.all([
    prisma.contact.findMany({
      where: { email: { not: null } },
      orderBy: { name: "asc" },
    }),
    prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--navy)]">發送 Email</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          挑選聯絡人，快速發送課程資訊或分會通知
        </p>
      </div>

      {typeof sent === "string" && (
        <p className="card border-l-4 border-l-[var(--orange)] p-4 text-sm">
          已成功發送 {sent} 封信件
        </p>
      )}

      <form action={sendBroadcastEmail} className="card flex flex-col gap-4 p-5">
        <div>
          <label className="label" htmlFor="subject">主旨 *</label>
          <input className="input" id="subject" name="subject" required />
        </div>
        <div>
          <label className="label" htmlFor="message">內容 *</label>
          <textarea className="input" id="message" name="message" rows={8} required />
        </div>
        <div>
          <span className="label">收件人（僅顯示已填 Email 的聯絡人）</span>
          {contacts.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">目前尚無填寫 Email 的聯絡人</p>
          ) : (
            <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto rounded-md border border-[var(--border)] p-3 sm:grid-cols-2">
              {contacts.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="contactIds" value={c.id} />
                  {c.name}
                  <span className="text-xs text-[var(--muted)]">{c.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <button className="btn-primary self-start" type="submit">
          發送信件
        </button>
      </form>

      <div className="card p-5">
        <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">最近寄送紀錄</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">尚無寄送紀錄</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--muted)]">
              <tr>
                <th className="py-2">收件人</th>
                <th className="py-2">主旨</th>
                <th className="py-2">狀態</th>
                <th className="py-2">時間</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2">{log.to}</td>
                  <td className="py-2">{log.subject}</td>
                  <td className="py-2">
                    <span
                      className={`badge ${
                        log.status === "SENT"
                          ? "bg-[var(--blue-light)] text-[var(--blue)]"
                          : "bg-[var(--orange-light)] text-[var(--orange)]"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 text-[var(--muted)]">
                    {log.createdAt.toLocaleString("zh-TW", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
