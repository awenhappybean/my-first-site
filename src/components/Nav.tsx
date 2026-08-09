import Link from "next/link";

const links = [
  { href: "/", label: "總覽" },
  { href: "/contacts", label: "通訊錄" },
  { href: "/calendar", label: "日曆" },
  { href: "/meetings", label: "一對一紀錄" },
  { href: "/email", label: "發送 Email" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--navy)] text-sm font-bold text-white">
            B
          </span>
          <span className="text-base font-bold text-[var(--navy)]">
            BNI 管理助理
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm font-medium">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-[var(--muted)] transition-colors hover:bg-[var(--blue-light)] hover:text-[var(--blue)]"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/book" className="ml-2 btn-accent text-sm">
            預約一對一
          </Link>
        </nav>
      </div>
    </header>
  );
}
