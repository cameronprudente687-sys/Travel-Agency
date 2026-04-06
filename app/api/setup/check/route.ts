import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Setup is only allowed if no ADMIN or ADVISOR user exists
    const adminCount = await db.user.count({
      where: { role: { in: ["ADMIN", "ADVISOR"] } },
    })

    return NextResponse.json({ allowed: adminCount === 0 })
  } catch {
    return NextResponse.json({ allowed: false })
  }
}
