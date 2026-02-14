import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Copy, Check } from "lucide-react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/db"

async function getQuiz(id: string, userId: string) {
  return await prisma.quiz.findFirst({
    where: { id, userId },
    include: {
      curriculum: true,
    },
  })
}

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params
  const quiz = await getQuiz(id, session.user.id)

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold text-slate-900">Quiz not found</h2>
              <Link href="/dashboard">
                <Button variant="link" className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const questionsRaw = quiz.questions as unknown
  const parsedQuestions = typeof questionsRaw === 'string' ? JSON.parse(questionsRaw) : questionsRaw
  const questions: Array<{
    type: "multiple_choice" | "short_answer"
    question: string
    options?: string[]
    correctAnswer: string
    explanation: string
  }> = parsedQuestions as Array<{
    type: "multiple_choice" | "short_answer"
    question: string
    options?: string[]
    correctAnswer: string
    explanation: string
  }>

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-fade-in">
          {/* Back button */}
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Quiz Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {questions.length} questions • Created{" "}
                    {new Date(quiz.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </CardDescription>
                  {quiz.curriculum && (
                    <Badge variant="outline" className="mt-2">
                      From: {quiz.curriculum.title}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Questions</h2>
            {questions.map((question: typeof questions[number], index: number) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-lg">{question.question}</p>
                      <Badge variant="outline" className="mt-2">
                        {question.type === "multiple_choice" ? "Multiple Choice" : "Short Answer"}
                      </Badge>
                    </div>
                  </div>

                  {question.type === "multiple_choice" && question.options && (
                    <div className="ml-11 space-y-2">
                      {question.options.map((option: string, optIndex: number) => {
                        const isCorrect = option.startsWith(question.correctAnswer)
                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border ${
                              isCorrect
                                ? "border-emerald-300 bg-emerald-50"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <span className="font-medium">{option}</span>
                            {isCorrect && (
                              <span className="ml-2 text-xs text-emerald-700 font-medium">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="ml-11 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="font-medium text-amber-900">Answer Key</p>
                    <p className="text-slate-700 mt-1">{question.correctAnswer}</p>
                    <p className="text-sm text-slate-600 mt-2">
                      <span className="font-medium">Explanation: </span>
                      {question.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
