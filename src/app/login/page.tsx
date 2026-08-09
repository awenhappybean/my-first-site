import { signIn } from "@/auth";

const ERROR_LABEL: Record<string, string> = {
  AccessDenied: "此 Google 帳號未被授權登入，請確認管理者是否已將您的 Email 加入 ADMIN_EMAILS。",
  Configuration: "登入設定有誤，請確認 Google OAuth 與 AUTH_SECRET 環境變數是否已正確設定。",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { error } = await searchParams;
  const errorMessage =
    typeof error === "string" ? ERROR_LABEL[error] ?? "登入發生錯誤，請再試一次。" : null;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-6">
      <div className="text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--navy)] text-lg font-bold text-white">
          B
        </span>
        <h1 className="text-xl font-bold text-[var(--navy)]">BNI 管理助理</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">請使用授權的 Google 帳號登入</p>
      </div>

      {errorMessage && (
        <p className="w-full rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <form
        className="w-full"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button className="btn-primary w-full" type="submit">
          使用 Google 帳號登入
        </button>
      </form>
    </div>
  );
}
