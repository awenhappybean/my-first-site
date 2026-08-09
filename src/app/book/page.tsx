import { createBooking } from "./actions";

export const dynamic = "force-dynamic";

export default function BookPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--navy)]">預約一對一</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          請填寫以下資訊完成預約，會談結束後我們會提供專屬連結讓您上傳名片與逐字稿。
        </p>
      </div>

      <form action={createBooking} className="card flex flex-col gap-4 p-6">
        <div>
          <label className="label" htmlFor="name">姓名 *</label>
          <input className="input" id="name" name="name" required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="company">公司</label>
            <input className="input" id="company" name="company" />
          </div>
          <div>
            <label className="label" htmlFor="industry">產業別</label>
            <input className="input" id="industry" name="industry" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="bniChapter">所屬分會</label>
            <input className="input" id="bniChapter" name="bniChapter" />
          </div>
          <div>
            <label className="label" htmlFor="phone">電話</label>
            <input className="input" id="phone" name="phone" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email">Email（用於接收確認信與提醒）</label>
          <input className="input" id="email" name="email" type="email" />
        </div>
        <div>
          <label className="label" htmlFor="scheduledAt">預約時間 *</label>
          <input className="input" id="scheduledAt" name="scheduledAt" type="datetime-local" required />
        </div>
        <div>
          <label className="label" htmlFor="location">會面地點</label>
          <input className="input" id="location" name="location" placeholder="例：咖啡廳 / Google Meet 連結" />
        </div>
        <div>
          <label className="label" htmlFor="notes">備註</label>
          <textarea className="input" id="notes" name="notes" rows={3} placeholder="想聊的主題、目前的需求等" />
        </div>
        <button className="btn-accent mt-2" type="submit">
          送出預約
        </button>
      </form>
    </div>
  );
}
