import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/db"

interface LessonStep {
  minutes: number | null
  title: string
  detail: string
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params
  const lesson = await prisma.lesson.findFirst({
    where: { id, userId: session.user.id },
    include: {
      curriculum: { select: { id: true, title: true } },
      prompt: { select: { id: true, title: true } },
    },
  })

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold text-slate-900">Lesson not found</h2>
              <Link href="/lessons">
                <Button variant="link" className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to lessons
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const sequence = JSON.parse(lesson.sequence) as LessonStep[]
  const materials = JSON.parse(lesson.materials) as string[]

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
            <h1 className="text-3xl font-bold text-slate-900">{lesson.title}</h1>
            <p className="text-slate-600 mt-2">
              {lesson.curriculum && (
                <Link href={`/curricula/${lesson.curriculum.id}`} className="text-indigo-700 hover:underline">
                  {lesson.curriculum.title}
                </Link>
              )}
              {lesson.curriculum && lesson.prompt && " · "}
              {lesson.prompt && (
                <Link href={`/prompts/${lesson.prompt.id}`} className="text-indigo-700 hover:underline">
                  {lesson.prompt.title}
                </Link>
              )}
            </p>
            {lesson.note && <p className="text-sm text-slate-500 mt-2">Note: {lesson.note}</p>}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Objective</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{lesson.objective}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sequence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sequence.map((step, index) => (
                <div key={`${step.title}-${index}`} className="rounded-lg bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">
                    {index + 1}. {step.title}
                    {step.minutes ? <span className="text-slate-500 font-normal"> · {step.minutes} min</span> : null}
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed">{step.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {materials.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Check for understanding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{lesson.checkForUnderstanding}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
