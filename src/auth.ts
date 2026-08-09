import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

function allowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      const allowed = allowedEmails();
      const email = user.email?.toLowerCase();
      if (!email || allowed.length === 0) return false;
      return allowed.includes(email);
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      if (nextUrl.pathname.startsWith("/login")) return true;
      return isLoggedIn;
    },
  },
});
