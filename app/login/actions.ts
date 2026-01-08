"use server"

import { cookies } from "next/headers"

export async function verifyPassword(password: string) {
  const appPassword = process.env.APP_PASS

  if (!appPassword) {
    console.error("[v0] APP_PASS environment variable is not set")
    return { success: false, error: "Server configuration error" }
  }

  if (password === appPassword) {
    return { success: true }
  }

  return { success: false }
}

export async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("app-authenticated")
  return authCookie?.value === "true"
}
