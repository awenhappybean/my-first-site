import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createMeeting } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  NONE: "尚未產生",
  PENDING: "產生中",
  READY: "已完成",
  FAILED: "失敗",
};

export default async function MeetingsPage({
  searchParams,
}: PageProps<"/meetings">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  const [meetings, contacts] = await Promise.all([
    prisma.meeting.findMany({
      where: query
        ? {
            OR: [
              { transcript: { contains: query, mode: "insensitive" } },
              { summary: { contains: query, mode: "insensitive" } },
              { contact: { name: { contains: query, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: { contact: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--navy)]">分析一對一內容</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          瀏覽所有一對一逐字稿與 AI 產生的摘要，快速掌握轉介機會與待跟進事項
        </p>
      </div>

      <form className="card flex flex-wrap gap-3 p-4" method="get">
        <input
          className="input max-w-sm"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="搜尋逐字稿、摘要內容或聯絡人姓名關鍵字..."
        />
        <button className="btn-outline" type="submit">
          搜尋
        </button>
      </form>

      <details className="card p-5">
        <summary className="cursor-pointer text-lg font-semibold text-[var(--navy)]">
          新增一對一紀錄（手動）
        </summary>
        <form action={createMeeting} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="contactId">聯絡人 *</label>
            <select className="input" id="contactId" name="contactId" required defaultValue="">
              <option value="" disabled>
                請選擇聯絡人
              </option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `（${c.company}）` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="businessCard">名片照片</label>
              <input className="input" id="businessCard" name="businessCard" type="file" accept="image/*" />
            </div>
            <div>
              <label className="label" htmlFor="slide">簡報 / 資料照片</label>
              <input className="input" id="slide" name="slide" type="file" accept="image/*" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="transcript">逐字稿 / 談話重點</label>
            <textarea className="input" id="transcript" name="transcript" rows={6} />
          </div>
          <div>
            <button className="btn-primary" type="submit">
              建立紀錄
            </button>
          </div>
        </form>
      </details>

      <div className="flex flex-col gap-3">
        {meetings.length === 0 && (
          <p className="card p-6 text-sm text-[var(--muted)]">尚無一對一紀錄</p>
        )}
        {meetings.map((m) => (
          <Link
            key={m.id}
            href={`/meetings/${m.id}`}
            className="card flex flex-col gap-2 p-5 transition-colors hover:border-[var(--blue)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--navy)]">{m.contact.name}</span>
              <span className="badge bg-[var(--orange-light)] text-[var(--orange)]">
                {STATUS_LABEL[m.summaryStatus]}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {m.createdAt.toLocaleString("zh-TW", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p className="line-clamp-2 text-sm text-[var(--muted)]">
              {m.summary ?? m.transcript ?? "尚無逐字稿內容"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
