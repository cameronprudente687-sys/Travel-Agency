import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) return NextResponse.json({ valid: false })

  const user = await db.user.findFirst({
    where: {
      inviteToken: token,
      tokenExpiresAt: { gt: new Date() },
    },
  })

  if (!user) return NextResponse.json({ valid: false })

  return NextResponse.json({ valid: true, name: user.name })
}
