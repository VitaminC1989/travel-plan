import type { NextAuthOptions, Session } from "next-auth"
import { getServerSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

const providers: NextAuthOptions["providers"] = [
  Credentials({
    id: "magic-link",
    name: "Email 登录",
    credentials: {
      email: { label: "邮箱", type: "email", placeholder: "you@example.com" },
      name: { label: "姓名", type: "text", placeholder: "你的名字" },
    },
    async authorize(credentials) {
      if (!credentials?.email) {
        return null
      }

      return {
        id: credentials.email,
        email: credentials.email,
        name: credentials.name || credentials.email.split("@")[0],
      }
    },
  }),
  ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
    ? [
        GitHub({
          clientId: process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET,
        }),
      ]
    : []),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []),
]

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        if (typeof user.name === "string") {
          token.name = user.name
        }
        if (typeof user.email === "string") {
          token.email = user.email
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        const tokenId = typeof token.id === "string" ? token.id : session.user.id
        if (tokenId) {
          session.user.id = tokenId
        }

        const tokenName = typeof token.name === "string" ? token.name : session.user.name
        if (tokenName) {
          session.user.name = tokenName as string
        }

        const tokenEmail = typeof token.email === "string" ? token.email : session.user.email
        if (tokenEmail) {
          session.user.email = tokenEmail as string
        }
      }

      return session
    },
  },
}

export const getAuthSession = async (): Promise<Session | null> => {
  return getServerSession(authOptions)
}
