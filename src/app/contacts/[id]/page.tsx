import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateContact, deleteContact } from "../actions";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: PageProps<"/contacts/[id]">) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      bookings: { orderBy: { scheduledAt: "desc" } },
      meetings: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!contact) notFound();

  const updateWithId = updateContact.bind(null, contact.id);
  const deleteWithId = deleteContact.bind(null, contact.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--navy)]">{contact.name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {contact.company ?? "未填寫公司"} {contact.title ? `／${contact.title}` : ""}
          </p>
        </div>
        <Link href="/contacts" className="btn-outline">
          返回通訊錄
        </Link>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-lg font-semibold text-[var(--navy)]">編輯資料</h2>
        <form action={updateWithId} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="name">姓名 *</label>
            <input className="input" id="name" name="name" defaultValue={contact.name} required />
          </div>
          <div>
            <label className="label" htmlFor="company">公司</label>
            <input className="input" id="company" name="company" defaultValue={contact.company ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="title">職稱</label>
            <input className="input" id="title" name="title" defaultValue={contact.title ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="industry">產業別</label>
            <input className="input" id="industry" name="industry" defaultValue={contact.industry ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="bniChapter">所屬分會</label>
            <input className="input" id="bniChapter" name="bniChapter" defaultValue={contact.bniChapter ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="phone">電話</label>
            <input className="input" id="phone" name="phone" defaultValue={contact.phone ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" defaultValue={contact.email ?? ""} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="label" htmlFor="address">地址</label>
            <input className="input" id="address" name="address" defaultValue={contact.address ?? ""} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="label" htmlFor="notes">備註</label>
            <textarea className="input" id="notes" name="notes" rows={3} defaultValue={contact.notes ?? ""} />
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" type="submit">
              儲存變更
            </button>
          </div>
        </form>
        <form action={deleteWithId} className="mt-4">
          <button
            className="text-sm font-medium text-red-600 hover:underline"
            type="submit"
          >
            刪除此聯絡人
          </button>
        </form>
      </div>

      {contact.address && (
        <div className="card p-5">
          <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">地圖位置</h2>
          <iframe
            className="h-72 w-full rounded-lg border border-[var(--border)]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`}
          />
        </div>
      )}

      <div className="card p-5">
        <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">預約紀錄</h2>
        {contact.bookings.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">尚無預約紀錄</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {contact.bookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 text-sm">
                <span>{format(b.scheduledAt, "yyyy/MM/dd HH:mm")}</span>
                <span className="badge bg-[var(--blue-light)] text-[var(--blue)]">{b.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-lg font-semibold text-[var(--navy)]">一對一紀錄</h2>
        {contact.meetings.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">尚無一對一紀錄</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {contact.meetings.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/meetings/${m.id}`}
                  className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--blue)] hover:bg-[var(--blue-light)]"
                >
                  <span>{format(m.createdAt, "yyyy/MM/dd HH:mm")}</span>
                  <span className="badge bg-[var(--orange-light)] text-[var(--orange)]">{m.summaryStatus}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
