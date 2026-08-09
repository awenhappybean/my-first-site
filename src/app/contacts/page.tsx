import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createContact } from "./actions";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: PageProps<"/contacts">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  const contacts = await prisma.contact.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { industry: { contains: query, mode: "insensitive" } },
            { bniChapter: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--navy)]">通訊錄整理</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          管理所有 BNI 夥伴與潛在客戶的聯絡資訊
        </p>
      </div>

      <form className="card flex flex-wrap gap-3 p-4" method="get">
        <input
          className="input max-w-xs"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="搜尋姓名、公司、產業、分會..."
        />
        <button className="btn-outline" type="submit">
          搜尋
        </button>
      </form>

      <div className="card p-5">
        <h2 className="mb-4 text-lg font-semibold text-[var(--navy)]">
          新增聯絡人
        </h2>
        <form action={createContact} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="name">姓名 *</label>
            <input className="input" id="name" name="name" required />
          </div>
          <div>
            <label className="label" htmlFor="company">公司</label>
            <input className="input" id="company" name="company" />
          </div>
          <div>
            <label className="label" htmlFor="title">職稱</label>
            <input className="input" id="title" name="title" />
          </div>
          <div>
            <label className="label" htmlFor="industry">產業別</label>
            <input className="input" id="industry" name="industry" />
          </div>
          <div>
            <label className="label" htmlFor="bniChapter">所屬分會</label>
            <input className="input" id="bniChapter" name="bniChapter" placeholder="例：華冠分會" />
          </div>
          <div>
            <label className="label" htmlFor="phone">電話</label>
            <input className="input" id="phone" name="phone" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="label" htmlFor="address">地址</label>
            <input className="input" id="address" name="address" placeholder="可用於 Google 地圖導航" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="label" htmlFor="notes">備註</label>
            <textarea className="input" id="notes" name="notes" rows={2} />
          </div>
          <div>
            <button className="btn-primary" type="submit">
              新增聯絡人
            </button>
          </div>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">姓名</th>
              <th className="px-4 py-3">公司 / 職稱</th>
              <th className="px-4 py-3">產業別</th>
              <th className="px-4 py-3">分會</th>
              <th className="px-4 py-3">聯絡方式</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-[var(--muted)]" colSpan={5}>
                  尚無聯絡人資料
                </td>
              </tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--blue-light)]/40">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/contacts/${c.id}`} className="text-[var(--blue)] hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {c.company ?? "-"} {c.title ? `／${c.title}` : ""}
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">{c.industry ?? "-"}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{c.bniChapter ?? "-"}</td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {c.phone ?? c.email ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
