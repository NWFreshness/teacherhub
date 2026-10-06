import { NextResponse } from "next/server"
import OpenAI from "openai"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

function curriculumText(content: string) {
  try {
    const parsed = JSON.parse(content) as {
      topics?: Array<{ name?: string; content?: string }>
    }
    if (parsed.topics?.length) {
      return parsed.topics
        .map((topic) => `${topic.name || "Topic"}: ${topic.content || ""}`)
        .join("\n\n")
    }
  } catch {
    return content
  }
  return content
}

function readLesson(value: unknown) {
  if (!value || typeof value !== "object") {
    throw new Error("Lesson response was not an object")
  }
  const record = value as Record<string, unknown>
  const title = typeof record.title === "string" ? record.title.trim() : ""
  const objective = typeof record.objective === "string" ? record.objective.trim() : ""
  const checkForUnderstanding =
    typeof record.checkForUnderstanding === "string" ? record.checkForUnderstanding.trim() : ""
  if (!title || !objective || !checkForUnderstanding) {
    throw new Error("Lesson response was missing required fields")
  }
  if (!Array.isArray(record.sequence) || !Array.isArray(record.materials)) {
    throw new Error("Lesson response was missing sequence or materials")
  }

  const sequence = record.sequence.flatMap((step) => {
    if (!step || typeof step !== "object") return []
    const item = step as Record<string, unknown>
    const stepTitle = typeof item.title === "string" ? item.title.trim() : ""
    const detail = typeof item.detail === "string" ? item.detail.trim() : ""
    if (!stepTitle || !detail) return []
    const minutes = typeof item.minutes === "number" ? item.minutes : null
    return [{ minutes, title: stepTitle, detail }]
  })
  const materials = record.materials.filter((item): item is string => typeof item === "string" && item.trim() !== "")

  if (sequence.length === 0 || materials.length === 0) {
    throw new Error("Lesson response had an empty sequence or materials list")
  }

  return { title, objective, sequence, materials, checkForUnderstanding }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const curriculumId = typeof body.curriculumId === "string" ? body.curriculumId : ""
    const promptId = typeof body.promptId === "string" ? body.promptId : ""
    const note = typeof body.note === "string" ? body.note.trim() : ""

    if (!curriculumId || !promptId) {
      return NextResponse.json(
        { error: "Choose a curriculum and a prompt" },
        { status: 400 }
      )
    }

    if (!process.env.XAI_API_KEY) {
      return NextResponse.json(
        { error: "Add XAI_API_KEY to .env to generate lessons." },
        { status: 500 }
      )
    }

    const [curriculum, prompt] = await Promise.all([
      prisma.curriculum.findFirst({
        where: {
          id: curriculumId,
          OR: [{ isPublic: true }, { userId: session.user.id }],
        },
      }),
      prisma.prompt.findFirst({
        where: {
          id: promptId,
          OR: [{ isPublic: true }, { userId: session.user.id }],
        },
      }),
    ])

    if (!curriculum || !prompt) {
      return NextResponse.json({ error: "Curriculum or prompt not found" }, { status: 404 })
    }

    const client = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    })

    const response = await client.responses.create({
      model: "grok-4.7",
      input: `You are an expert K-12 teacher. Use the teacher's prompt to plan one lesson from the curriculum.

Teacher prompt:
${prompt.body}

Teacher note:
${note || "None"}

Curriculum: ${curriculum.title}
Subject: ${curriculum.subject}
Grade: ${curriculum.gradeLevel}
${curriculumText(curriculum.content)}

Return only JSON with this shape:
{
  "title": "short lesson title",
  "objective": "what students will be able to do",
  "sequence": [
    { "minutes": 10, "title": "step name", "detail": "what the teacher and students do" }
  ],
  "materials": ["item"],
  "checkForUnderstanding": "how the teacher checks learning before the lesson ends"
}`,
    })

    const responseText = response.output_text
    if (!responseText) {
      return NextResponse.json({ error: "Failed to generate lesson" }, { status: 500 })
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const lessonBody = readLesson(JSON.parse(jsonMatch ? jsonMatch[0] : responseText))

    const lesson = await prisma.lesson.create({
      data: {
        title: lessonBody.title,
        note: note || null,
        objective: lessonBody.objective,
        sequence: JSON.stringify(lessonBody.sequence),
        materials: JSON.stringify(lessonBody.materials),
        checkForUnderstanding: lessonBody.checkForUnderstanding,
        curriculumId: curriculum.id,
        promptId: prompt.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Error generating lesson:", error)
    return NextResponse.json({ error: "Failed to generate lesson" }, { status: 500 })
  }
}
