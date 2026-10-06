import { auth } from "@/auth"
import Link from "next/link"
import { BookOpen, MessageSquare, NotebookPen, Sparkles, ArrowRight, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/db"

async function getStats(userId: string) {
  const [curriculaCount, quizzesCount, promptsCount, lessonsCount] = await Promise.all([
    prisma.curriculum.count({
      where: {
        OR: [{ userId }, { saves: { some: { userId } } }],
      },
    }),
    prisma.quiz.count({
      where: { userId },
    }),
    prisma.prompt.count({
      where: {
        OR: [{ userId }, { saves: { some: { userId } } }],
      },
    }),
    prisma.lesson.count({
      where: { userId },
    }),
  ])

  return { curriculaCount, quizzesCount, promptsCount, lessonsCount }
}

async function getRecentLessons(userId: string) {
  return await prisma.lesson.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, title: true, createdAt: true },
  })
}

async function getRecentQuizzes(userId: string) {
  return await prisma.quiz.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  })
}

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  const stats = await getStats(session.user.id)
  const [recentQuizzes, recentLessons] = await Promise.all([
    getRecentQuizzes(session.user.id),
    getRecentLessons(session.user.id),
  ])

  const firstName = session.user.name?.split(" ")[0] || "Teacher"

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {firstName}!
          </h1>
          <p className="text-slate-600 mt-1">
            Ready to create some amazing lessons today?
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/curricula">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Browse Curricula
            </Button>
          </Link>
          <Link href="/prompts">
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Prompt Library
            </Button>
          </Link>
          <Link href="/lessons/new">
            <Button variant="outline" className="gap-2">
              <NotebookPen className="h-4 w-4" />
              Start a lesson
            </Button>
          </Link>
          <Link href="/quiz-generator">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/curricula?mine=1">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              My Curricula
            </CardTitle>
            <BookOpen className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.curriculaCount}</div>
            <p className="text-xs text-slate-500 mt-1">Created or saved</p>
          </CardContent>
        </Card>
        </Link>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Quizzes
            </CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.quizzesCount}</div>
            <p className="text-xs text-slate-500 mt-1">Generated quizzes</p>
          </CardContent>
        </Card>

        <Link href="/prompts?mine=1">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              My Prompts
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.promptsCount}</div>
            <p className="text-xs text-slate-500 mt-1">Created or saved</p>
          </CardContent>
        </Card>
        </Link>

        <Link href="/lessons">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              My Lessons
            </CardTitle>
            <NotebookPen className="h-4 w-4 text-teal-700" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.lessonsCount}</div>
            <p className="text-xs text-slate-500 mt-1">Lessons you generated</p>
          </CardContent>
        </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Quizzes</CardTitle>
          <CardDescription>Your recently generated quizzes</CardDescription>
        </CardHeader>
        <CardContent>
          {recentQuizzes.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No quizzes yet</p>
              <Link href="/quiz-generator">
                <Button variant="link" className="mt-2">
                  Generate your first quiz <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                      <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{quiz.title}</p>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(quiz.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <Link href={`/quizzes/${quiz.id}`}>
                    <Button variant="ghost" size="sm">
                      View <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Lessons</CardTitle>
          <CardDescription>Lessons started from a curriculum and a prompt</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLessons.length === 0 ? (
            <div className="text-center py-8">
              <NotebookPen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No lessons yet</p>
              <Link href="/lessons/new">
                <Button variant="link" className="mt-2">
                  Start your first lesson <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                      <NotebookPen className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{lesson.title}</p>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <Link href={`/lessons/${lesson.id}`}>
                    <Button variant="ghost" size="sm">
                      View <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/curricula">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                  <BookOpen className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Curriculum Hub</h3>
                  <p className="text-sm text-slate-500">
                    Browse and download WA/OR Common Core curricula
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/prompts">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100">
                  <MessageSquare className="h-7 w-7 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Prompt Library</h3>
                  <p className="text-sm text-slate-500">
                    Share and reuse teacher-made AI prompts
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/lessons/new">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100">
                  <NotebookPen className="h-7 w-7 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Lesson Starter</h3>
                  <p className="text-sm text-slate-500">
                    Turn a curriculum and a prompt into a lesson
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/quiz-generator">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100">
                  <Sparkles className="h-7 w-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">AI Quiz Generator</h3>
                  <p className="text-sm text-slate-500">
                    Create quizzes from any curriculum content
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
