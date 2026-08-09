export { auth as proxy } from "@/auth";

// 僅保護內部管理頁面；/book 預約與會後上傳頁面維持免登入，讓 BNI 夥伴可直接使用
export const config = {
  matcher: [
    "/",
    "/contacts/:path*",
    "/calendar/:path*",
    "/meetings/:path*",
    "/email/:path*",
  ],
};
