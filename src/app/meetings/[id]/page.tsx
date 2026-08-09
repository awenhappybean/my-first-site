import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateTranscript, regenerateSummary } from "../actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  BUSINESS_CARD: "名片",
  SLIDE: "簡報 / 資料",
  OTHER: "其他",
};

export default async function MeetingDetailPage({
  params,
}: PageProps<"/meetings/[id]">) {
  const { id } = await params;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { contact: true, photos: true },
  });

  if (!meeting) notFound();

  const updateWithId = updateTranscript.bind(null, meeting.id);
  const regenerateWithId = regenerateSummary.bind(null, meeting.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--navy)]">
            <Link href={`/contacts/${meeting.contact.id}`} className="hover:underline">
              {meeting.contact.name}
            </Link>{" "}
            的一對一紀錄
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {meeting.createdAt.toLocaleString("zh-TW", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <Link href="/meetings" className="btn-outline">
          返回列表
        </Link>
      </div>

      {meeting.photos.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">照片</h2>
          <div className="flex flex-wrap gap-4">
            {meeting.photos.map((p) => (
              <figure key={p.id} className="w-40">
                {/* 上傳圖片來自使用者，直接以 <img> 顯示，避免 next/image 遠端網域限制 */}
                <img
                  src={`/api/files/${p.filename}`}
                  alt={TYPE_LABEL[p.type]}
                  className="h-40 w-40 rounded-lg border border-[var(--border)] object-cover"
                />
                <figcaption className="mt-1 text-center text-xs text-[var(--muted)]">
                  {TYPE_LABEL[p.type]}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">逐字稿 / 談話重點</h2>
        <form action={updateWithId} className="flex flex-col gap-3">
          <textarea
            className="input"
            name="transcript"
            rows={10}
            defaultValue={meeting.transcript ?? ""}
          />
          <div className="flex gap-3">
            <button className="btn-outline" type="submit">
              儲存逐字稿
            </button>
          </div>
        </form>
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--navy)]">AI 摘要</h2>
          <form action={regenerateWithId}>
            <button className="btn-accent" type="submit">
              {meeting.summary ? "重新產生摘要" : "產生摘要"}
            </button>
          </form>
        </div>
        {meeting.summaryStatus === "PENDING" && (
          <p className="text-sm text-[var(--muted)]">摘要產生中，請稍後重新整理頁面...</p>
        )}
        {meeting.summaryStatus === "FAILED" && (
          <p className="text-sm text-red-600">摘要產生失敗，請確認 ANTHROPIC_API_KEY 設定或逐字稿內容後再試一次。</p>
        )}
        {meeting.summary ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{meeting.summary}</div>
        ) : (
          meeting.summaryStatus === "NONE" && (
            <p className="text-sm text-[var(--muted)]">尚未產生摘要</p>
          )
        )}
      </div>
    </div>
  );
}
