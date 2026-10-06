import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { NotebookPen, Plus } from "lucide-react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/db"

export default async function LessonsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const lessons = await prisma.lesson.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      curriculum: { select: { title: true } },
      prompt: { select: { title: true } },
    },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Lessons</h1>
              <p className="text-slate-600 mt-1">Your lessons only. The curriculum and prompt hubs stay separate.</p>
            </div>
            <Link href="/lessons/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Start a lesson
              </Button>
            </Link>
          </div>

          {lessons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <NotebookPen className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No lessons yet</h3>
                <p className="text-slate-500 mb-4">Choose a curriculum and a prompt to write the first one.</p>
                <Link href="/lessons/new">
                  <Button>Start a lesson</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-lg">{lesson.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{lesson.objective}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-xs text-slate-500 space-y-1">
                      {lesson.curriculum && <p>{lesson.curriculum.title}</p>}
                      {lesson.prompt && <p>Prompt: {lesson.prompt.title}</p>}
                    </div>
                    <Link href={`/lessons/${lesson.id}`}>
                      <Button className="w-full">View lesson</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
