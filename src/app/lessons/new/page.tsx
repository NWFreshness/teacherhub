import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { LessonForm } from "@/components/lesson-form"
import { prisma } from "@/lib/db"

export default async function NewLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ curriculum?: string; prompt?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const params = await searchParams
  const [curricula, prompts] = await Promise.all([
    prisma.curriculum.findMany({
      where: { OR: [{ isPublic: true }, { userId: session.user.id }] },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.prompt.findMany({
      where: { OR: [{ isPublic: true }, { userId: session.user.id }] },
      orderBy: { title: "asc" },
      select: { id: true, title: true, curriculumId: true },
    }),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6 animate-fade-in">
          <Link href="/lessons">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to lessons
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lesson starter</h1>
            <p className="text-slate-600 mt-1">
              Pick a curriculum and a prompt. Add a note about time or materials, then save the lesson it writes.
            </p>
          </div>
          <LessonForm
            curricula={curricula}
            prompts={prompts}
            initialCurriculumId={params.curriculum || ""}
            initialPromptId={params.prompt || ""}
          />
        </div>
      </main>
    </div>
  )
}
