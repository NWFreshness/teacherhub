import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { AI_TOOLS, GRADE_LEVELS, PURPOSES, SUBJECTS } from "@/lib/prompt-options"

function optionalValue(value: unknown, allowed?: readonly string[]) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (allowed && !allowed.includes(trimmed)) return null
  return trimmed
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = optionalValue(searchParams.get("subject"), SUBJECTS)
    const gradeLevel = optionalValue(searchParams.get("gradeLevel"), GRADE_LEVELS)
    const purpose = optionalValue(searchParams.get("purpose"), PURPOSES)
    const search = searchParams.get("search")?.trim()

    const where: Record<string, unknown> = { isPublic: true }
    if (subject) where.subject = subject
    if (gradeLevel) where.gradeLevel = gradeLevel
    if (purpose) where.purpose = purpose
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { body: { contains: search } },
      ]
    }

    const prompts = await prisma.prompt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        curriculum: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json(prompts)
  } catch (error) {
    console.error("Error fetching prompts:", error)
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const promptBody = typeof body.body === "string" ? body.body.trim() : ""

    if (!title || !promptBody) {
      return NextResponse.json(
        { error: "Title and prompt text are required" },
        { status: 400 }
      )
    }

    const curriculumId = optionalValue(body.curriculumId)
    if (curriculumId) {
      const curriculum = await prisma.curriculum.findFirst({
        where: {
          id: curriculumId,
          OR: [{ isPublic: true }, { userId: session.user.id }],
        },
      })
      if (!curriculum) {
        return NextResponse.json({ error: "Curriculum not found" }, { status: 400 })
      }
    }

    const prompt = await prisma.prompt.create({
      data: {
        title,
        body: promptBody,
        description: optionalValue(body.description),
        subject: optionalValue(body.subject, SUBJECTS),
        gradeLevel: optionalValue(body.gradeLevel, GRADE_LEVELS),
        purpose: optionalValue(body.purpose, PURPOSES),
        aiTool: optionalValue(body.aiTool, AI_TOOLS),
        curriculumId,
        isPublic: body.isPublic !== false,
        userId: session.user.id,
      },
    })

    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Error creating prompt:", error)
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
  }
}
