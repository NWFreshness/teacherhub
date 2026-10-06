import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

async function readTarget(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const body = await request.json()
  const kind = body.kind === "curriculum" || body.kind === "prompt" ? body.kind : null
  const id = typeof body.id === "string" ? body.id : ""
  if (!kind || !id) {
    return { response: NextResponse.json({ error: "Missing save target" }, { status: 400 }) }
  }

  return { userId: session.user.id, kind, id }
}

export async function POST(request: Request) {
  try {
    const target = await readTarget(request)
    if ("response" in target) return target.response

    if (target.kind === "curriculum") {
      const curriculum = await prisma.curriculum.findFirst({
        where: {
          id: target.id,
          OR: [{ isPublic: true }, { userId: target.userId }],
        },
      })
      if (!curriculum) {
        return NextResponse.json({ error: "Curriculum not found" }, { status: 404 })
      }
      await prisma.savedCurriculum.upsert({
        where: {
          userId_curriculumId: { userId: target.userId, curriculumId: target.id },
        },
        update: {},
        create: { userId: target.userId, curriculumId: target.id },
      })
    } else {
      const prompt = await prisma.prompt.findFirst({
        where: {
          id: target.id,
          OR: [{ isPublic: true }, { userId: target.userId }],
        },
      })
      if (!prompt) {
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
      }
      await prisma.savedPrompt.upsert({
        where: {
          userId_promptId: { userId: target.userId, promptId: target.id },
        },
        update: {},
        create: { userId: target.userId, promptId: target.id },
      })
    }

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error("Error saving item:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const target = await readTarget(request)
    if ("response" in target) return target.response

    if (target.kind === "curriculum") {
      await prisma.savedCurriculum.deleteMany({
        where: { userId: target.userId, curriculumId: target.id },
      })
    } else {
      await prisma.savedPrompt.deleteMany({
        where: { userId: target.userId, promptId: target.id },
      })
    }

    return NextResponse.json({ saved: false })
  } catch (error) {
    console.error("Error removing save:", error)
    return NextResponse.json({ error: "Failed to remove save" }, { status: 500 })
  }
}
