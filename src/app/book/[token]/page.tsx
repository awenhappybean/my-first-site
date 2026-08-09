import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { submitMeetingMaterials } from "../actions";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: PageProps<"/book/[token]">) {
  const { token } = await params;

  const booking = await prisma.booking.findUnique({
    where: { token },
    include: { contact: true, meeting: { include: { photos: true } } },
  });

  if (!booking) notFound();

  const submitWithToken = submitMeetingMaterials.bind(null, token);
  const scheduledLabel = booking.scheduledAt.toLocaleString("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-[var(--navy)]">
          {booking.contact.name} 的一對一預約
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">預約時間：{scheduledLabel}</p>
        {booking.location && (
          <p className="text-sm text-[var(--muted)]">地點：{booking.location}</p>
        )}
        <span className="badge mt-3 bg-[var(--blue-light)] text-[var(--blue)]">
          {booking.status}
        </span>
      </div>

      <div className="card p-6">
        <h2 className="mb-1 text-lg font-semibold text-[var(--navy)]">
          會談後：上傳資料
        </h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          會談結束後，請在此上傳名片 / 簡報照片，並貼上逐字稿或談話重點，系統會自動整理成有目的性的摘要。
        </p>
        <form action={submitWithToken} className="flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="businessCard">名片照片</label>
            <input className="input" id="businessCard" name="businessCard" type="file" accept="image/*" />
          </div>
          <div>
            <label className="label" htmlFor="slide">簡報 / 資料照片</label>
            <input className="input" id="slide" name="slide" type="file" accept="image/*" />
          </div>
          <div>
            <label className="label" htmlFor="transcript">逐字稿 / 談話重點</label>
            <textarea
              className="input"
              id="transcript"
              name="transcript"
              rows={8}
              defaultValue={booking.meeting?.transcript ?? ""}
              placeholder="貼上錄音轉出的逐字稿，或簡短記錄談話重點..."
            />
          </div>
          <button className="btn-primary" type="submit">
            送出並產生摘要
          </button>
        </form>
      </div>

      {booking.meeting?.summary && (
        <div className="card p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">AI 摘要</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
            {booking.meeting.summary}
          </div>
        </div>
      )}

      {booking.meeting?.summaryStatus === "FAILED" && (
        <p className="text-sm text-red-600">摘要產生失敗，請確認逐字稿內容或稍後再試。</p>
      )}
    </div>
  );
}
