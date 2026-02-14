import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get("subject")
    const gradeLevel = searchParams.get("gradeLevel")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {
      isPublic: true
    }

    if (subject) {
      where.subject = subject
    }

    if (gradeLevel) {
      where.gradeLevel = gradeLevel
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const curricula = await prisma.curriculum.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(curricula)
  } catch (error) {
    console.error("Error fetching curricula:", error)
    return NextResponse.json(
      { error: "Failed to fetch curricula" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, subject, gradeLevel, content } = body

    if (!title || !subject || !gradeLevel || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const curriculum = await prisma.curriculum.create({
      data: {
        title,
        description,
        subject,
        gradeLevel,
        content: JSON.stringify(content),
        isPublic: false,
        userId: session.user.id,
      }
    })

    return NextResponse.json(curriculum)
  } catch (error) {
    console.error("Error creating curriculum:", error)
    return NextResponse.json(
      { error: "Failed to create curriculum" },
      { status: 500 }
    )
  }
}
