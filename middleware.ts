// middleware.ts

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const role = req.auth?.user?.role

  const isAuthPage = nextUrl.pathname.startsWith("/login")
  const isDashboard = nextUrl.pathname.startsWith("/dashboard") || 
                      nextUrl.pathname.startsWith("/admin") ||
                      nextUrl.pathname.startsWith("/staff") ||
                      nextUrl.pathname.startsWith("/client")

  if (!req.auth && isDashboard) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  if (req.auth && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl))
  }
  if (nextUrl.pathname.startsWith("/staff") && role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};