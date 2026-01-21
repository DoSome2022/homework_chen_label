// import NextAuth from "next-auth"
// import Credentials from "next-auth/providers/credentials"
// import { PrismaAdapter } from "@auth/prisma-adapter"
// import bcrypt from "bcryptjs"
// import db from "./db"
// import { Role, CustomerType } from "@prisma/client"

// // ▼▼▼ 1. 新增這個 import ▼▼▼
// import type { Adapter } from "next-auth/adapters"

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   // ▼▼▼ 2. 修改這裡，加上 'as Adapter' 強制轉型 ▼▼▼
//   adapter: PrismaAdapter(db) as Adapter,
  
//   session: { strategy: "jwt" },
//   providers: [
//     Credentials({
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
// async authorize(credentials) {
//   console.log("Login attempt with email:", credentials?.email)
  
//   const user = await db.user.findUnique({
//     where: { email: credentials.email as string }
//   })
  
//   if (!user) {
//     console.log("User not found")
//     return null
//   }
  
//   if (!user.password) {
//     console.log("No password stored")
//     return null
//   }
  
//   const isValid = await bcrypt.compare(credentials.password as string, user.password)
//   console.log("Password match:", isValid)
  
//   if (!isValid) return null
  
//   return { id: user.id, email: user.email, name: user.name, role: user.role, customerType: user.customerType }
// }
//     })
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = user.role
//         token.customerType = user.customerType
//       }
//       return token
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.sub as string
//         session.user.role = token.role as Role
//         session.user.customerType = token.customerType as CustomerType | null
//       }
//       return session
//     }
//   },
//   pages: {
//     signIn: "/login",
//   }
// })



// import NextAuth from "next-auth"
// import Credentials from "next-auth/providers/credentials"
// import Google from "next-auth/providers/google"       // ← 新增這行
// import { PrismaAdapter } from "@auth/prisma-adapter"
// import bcrypt from "bcryptjs"
// import db from "./db"
// import { Role, CustomerType } from "@prisma/client"
// import type { Adapter } from "next-auth/adapters"

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   adapter: PrismaAdapter(db) as Adapter,

//   session: { strategy: "jwt" },

//   providers: [
//     Google({ 
//       // 如果你使用 AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET 命名，就可省略下面兩行
//       clientId: process.env.AUTH_GOOGLE_ID,
//       clientSecret: process.env.AUTH_GOOGLE_SECRET,

//       // 建議加上這段，讓 Google 每次都給 refresh_token（開發時很有用）
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code"
//         }
//       }
//     }),

//     Credentials({
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         console.log("Login attempt with email:", credentials?.email)
        
//         const user = await db.user.findUnique({
//           where: { email: credentials?.email as string }
//         })
        
//         if (!user) {
//           console.log("User not found")
//           return null
//         }
        
//         if (!user.password) {
//           console.log("No password stored")
//           return null
//         }
        
//         const isValid = await bcrypt.compare(
//           credentials?.password as string, 
//           user.password
//         )
//         console.log("Password match:", isValid)
        
//         if (!isValid) return null
        
//         return { 
//           id: user.id, 
//           email: user.email, 
//           name: user.name, 
//           role: user.role, 
//           customerType: user.customerType 
//         }
//       }
//     })
//   ],

//   callbacks: {
//     async jwt({ token, user}) {
//       // Google 登入時也會進來這裡
//       if (user) {
//         token.role = user.role
//         token.customerType = user.customerType
//       }

//       // 如果需要從 Google 拿更多資料，可以在這裡處理
//       // if (account?.provider === "google") { ... }

//       return token
//     },

//     async session({ session, token }) {
//           console.log("SESSION callback triggered")
//     console.log("Token sub:", token.sub)
//     console.log("Session user email:", session.user?.email)
//       if (session.user) {
//         session.user.id = token.sub as string
//         session.user.role = token.role as Role
//         session.user.customerType = token.customerType as CustomerType | null
//       }



//       return session

      
//     },

//     // 可選：控制允許哪些帳號登入
//     // async signIn({ account, profile }) {
//     //   if (account?.provider === "google") {
//     //     return profile?.email_verified && profile?.email?.endsWith("@your-domain.com")
//     //   }
//     //   return true
//     // }
//   },

//   pages: {
//     signIn: "/login",
//   }
// })




import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import db from "./db"
import { Role, CustomerType } from "@prisma/client"
import type { Adapter } from "next-auth/adapters"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
 trustHost: true, // 显式告诉 NextAuth 信任当前主机
  session: { strategy: "jwt" },

  providers: [
    Google({ 
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      
      allowDangerousEmailAccountLinking: true,   // ← 新增這一行
      // 可選：如果你想要更多用戶資訊
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER", // 預設角色
          customerType: "NORMAL", // 預設客戶類型
        }
      }
    }),

    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Login attempt with email:", credentials?.email)
        
        const user = await db.user.findUnique({
          where: { email: credentials?.email as string }
        })
        
        if (!user) {
          console.log("User not found")
          return null
        }
        
        if (!user.password) {
          console.log("No password stored")
          return null
        }
        
        const isValid = await bcrypt.compare(
          credentials?.password as string, 
          user.password
        )
        console.log("Password match:", isValid)
        
        if (!isValid) return null
        
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role, 
          customerType: user.customerType 
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("=== SignIn Callback ===")
      console.log("Provider:", account?.provider)
      console.log("Profile:", profile)
      console.log("User:", user)
      
      // 如果是 Google 登入，且用戶不存在於資料庫
      if (account?.provider === "google" && profile) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: profile.email! }
          })
          
          if (!existingUser) {
            console.log("Creating new user from Google login")
            // 創建新用戶
            const newUser = await db.user.create({
              data: {
                email: profile.email!,
                name: profile.name!,
                role: "CUSTOMER",
                customerType: "NORMAL",
                // Google 用戶可以稍後設定密碼
              }
            })
            console.log("New user created:", newUser)
          } else {
            console.log("Existing user found:", existingUser)
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }
      
      return true
    },

    async jwt({ token, user, account, profile }) {
      console.log("=== JWT Callback ===")
      console.log("Provider:", account?.provider)
      console.log("Token before:", token)
      
      // 首次登入時，user 物件存在
      if (user) {
        token.role = user.role
        token.customerType = user.customerType
        token.provider = account?.provider
      }
      
      // 如果是 Google 登入，從資料庫獲取用戶資料
      if (account?.provider === "google" && !user) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email! }
          })
          
          if (dbUser) {
            token.role = dbUser.role
            token.customerType = dbUser.customerType
            token.id = dbUser.id
          }
        } catch (error) {
          console.error("Error fetching user in JWT callback:", error)
        }
      }
      
      console.log("Token after:", token)
      return token
    },

    async session({ session, token }) {
      console.log("=== Session Callback ===")
      console.log("Token:", token)
      console.log("Session before update:", session)
      
      if (session.user) {
        session.user.id = token.id as string || token.sub as string
        session.user.role = token.role as Role
        session.user.customerType = token.customerType as CustomerType | null
      }
      
      console.log("Session after update:", session)
      console.log("================================\n")
      
      return session
    }
  },

  pages: {
    signIn: "/login",
  },

  // 添加 debug 模式
  debug: process.env.NODE_ENV === "development"
})