import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionFromToken } from "@/lib/actions/session-action"

export async function GET(req: NextRequest) {
  try {
    // Get the session token from cookies
    const sessionToken = cookies().get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ session: null }, { status: 200 })
    }

    // Get the session from the token
    const result = await getSessionFromToken(sessionToken)

    if (!result.success) {
      cookies().delete("session_token")
      return NextResponse.json({ session: null }, { status: 200 })
    }

    return NextResponse.json({ session: result.session }, { status: 200 })
  } catch (error) {
    console.error("Session info error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
