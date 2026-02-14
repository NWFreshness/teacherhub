import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const curricula = await prisma.curriculum.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(curricula)
  } catch (error) {
    console.error("Error fetching user curricula:", error)
    return NextResponse.json(
      { error: "Failed to fetch curricula" },
      { status: 500 }
    )
  }
}
