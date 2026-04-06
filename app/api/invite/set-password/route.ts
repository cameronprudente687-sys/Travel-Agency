import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const user = await db.user.findFirst({
      where: {
        inviteToken: token,
        tokenExpiresAt: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired link. Please contact your advisor." }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        inviteToken: null,
        tokenExpiresAt: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 })
  }
}
