import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Credentials({
    name: "Локальный вход",
    credentials: { email: { label: "Email", type: "email" } },
    authorize: async (credentials) => {
      const email = typeof credentials.email === "string" ? credentials.email : null;
      if (!email) return null;
      return { id: email, email, name: email.split("@")[0] };
    }
  })],
  callbacks: { session: async ({ session, token }) => ({ ...session, user: { ...session.user, id: token.sub } }) }
});
