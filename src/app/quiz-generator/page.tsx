"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, Loader2, ArrowLeft, Check, Copy, FileText } from "lucide-react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Curriculum {
  id: string
  title: string
  subject: string
  gradeLevel: string
  content: unknown
}

interface Question {
  type: "multiple_choice" | "short_answer"
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
}

interface GeneratedQuiz {
  id: string
  title: string
  questions: Question[]
  createdAt: string
}

const subjectColors: Record<string, "math" | "science" | "ela" | "social"> = {
  Math: "math",
  Science: "science",
  ELA: "ela",
  "Social Studies": "social",
}

function QuizGeneratorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const curriculumIdParam = searchParams.get("curriculum")

  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("")
  const [customText, setCustomText] = useState("")
  const [inputMode, setInputMode] = useState<"curriculum" | "text">("curriculum")
  const [questionCount, setQuestionCount] = useState("10")
  const [difficulty, setDifficulty] = useState("medium")
  const [questionTypes, setQuestionTypes] = useState("mixed")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null)
  const [showAnswerKey, setShowAnswerKey] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchCurricula = async () => {
      try {
        const res = await fetch("/api/curriculums")
        const data = await res.json()
        setCurricula(data)
      } catch (err) {
        console.error("Failed to fetch curricula:", err)
      }
    }
    fetchCurricula()
  }, [])

  useEffect(() => {
    if (curriculumIdParam && curricula.length > 0) {
      setSelectedCurriculumId(curriculumIdParam)
      setInputMode("curriculum")
      const curriculum = curricula.find((c) => c.id === curriculumIdParam)
      if (curriculum) {
        setTitle(`Quiz: ${curriculum.title}`)
      }
    }
  }, [curriculumIdParam, curricula])

  const selectedCurriculum = curricula.find((c) => c.id === selectedCurriculumId)

  const getContentToGenerate = (): string => {
    if (inputMode === "curriculum" && selectedCurriculum) {
      const rawContent = selectedCurriculum.content as unknown
      const content = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent as {
        topics?: Array<{ name: string; content: string }>
      }
      if (content.topics) {
        return content.topics
          .map((t: { name: string; content: string }) => `${t.name}: ${t.content}`)
          .join("\n\n")
      }
      return typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent)
    }
    return customText
  }

  const handleGenerate = async () => {
    const content = getContentToGenerate()
    if (!content.trim()) {
      setError("Please select a curriculum or enter text to generate questions from")
      return
    }

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          curriculumId: inputMode === "curriculum" ? selectedCurriculumId : null,
          questionCount: parseInt(questionCount),
          difficulty,
          questionTypes,
          title: title || `Quiz - ${new Date().toLocaleDateString()}`,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to generate quiz")
        return
      }

      setGeneratedQuiz(data)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyQuiz = () => {
    if (!generatedQuiz) return
    const text = JSON.stringify(generatedQuiz.questions, null, 2)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI Quiz Generator</h1>
              <p className="text-slate-600 mt-1">
                Create quizzes from curriculum content using AI
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Settings</CardTitle>
                <CardDescription>
                  Select a curriculum or paste your own content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Input Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={inputMode === "curriculum" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputMode("curriculum")}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    From Curriculum
                  </Button>
                  <Button
                    variant={inputMode === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputMode("text")}
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Custom Text
                  </Button>
                </div>

                {/* Curriculum Selection */}
                {inputMode === "curriculum" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Curriculum</label>
                    <Select value={selectedCurriculumId} onValueChange={setSelectedCurriculumId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a curriculum..." />
                      </SelectTrigger>
                      <SelectContent>
                        {curricula.map((curriculum) => (
                          <SelectItem key={curriculum.id} value={curriculum.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant={subjectColors[curriculum.subject] || "default"} className="text-xs">
                                {curriculum.subject}
                              </Badge>
                              <span>{curriculum.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Custom Text Input */}
                {inputMode === "text" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Paste Content</label>
                    <Textarea
                      placeholder="Paste your curriculum content, article, or any text to generate questions from..."
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      rows={8}
                    />
                  </div>
                )}

                {/* Quiz Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quiz Title</label>
                  <Input
                    placeholder="Enter quiz title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Configuration */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Questions</label>
                    <Select value={questionCount} onValueChange={setQuestionCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Types</label>
                    <Select value={questionTypes} onValueChange={setQuestionTypes}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    {error}
                  </div>
                )}

                <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Quiz</CardTitle>
                  {generatedQuiz && (
                    <Button variant="outline" size="sm" onClick={handleCopyQuiz} className="gap-2">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy JSON"}
                    </Button>
                  )}
                </div>
                <CardDescription>
                  {generatedQuiz
                    ? `${generatedQuiz.questions.length} questions generated`
                    : "Your quiz will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!generatedQuiz ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="h-16 w-16 text-slate-300 mb-4" />
                    <p className="text-slate-500">
                      Configure your quiz settings and click Generate
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                    {/* Quiz Header */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-lg text-slate-900">{generatedQuiz.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Generated on{" "}
                        {new Date(generatedQuiz.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                      {generatedQuiz.questions.map((question, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{question.question}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {question.type === "multiple_choice" ? "Multiple Choice" : "Short Answer"}
                              </Badge>
                            </div>
                          </div>

                          {question.type === "multiple_choice" && question.options && (
                            <div className="ml-9 space-y-2">
                              {question.options.map((option, optIndex) => {
                                const isCorrect = option.startsWith(question.correctAnswer)
                                return (
                                  <div
                                    key={optIndex}
                                    className={`p-3 rounded-lg border ${
                                      showAnswerKey && isCorrect
                                        ? "border-emerald-300 bg-emerald-50"
                                        : "border-slate-200 bg-slate-50"
                                    }`}
                                  >
                                    <span className="font-medium">{option}</span>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {question.type === "short_answer" && (
                            <div className="ml-9">
                              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 min-h-[60px]">
                                <p className="text-sm text-slate-600 italic">Student answer space</p>
                              </div>
                            </div>
                          )}

                          {showAnswerKey && (
                            <div className="ml-9 p-3 rounded-lg bg-amber-50 border border-amber-200">
                              <p className="text-sm">
                                <span className="font-medium">Answer: </span>
                                {question.type === "multiple_choice"
                                  ? question.correctAnswer
                                  : question.correctAnswer}
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                <span className="font-medium">Explanation: </span>
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Toggle Answer Key */}
                    <div className="flex justify-center pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setShowAnswerKey(!showAnswerKey)}
                        className="gap-2"
                      >
                        {showAnswerKey ? "Hide Answer Key" : "Show Answer Key"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )
}

export default function QuizGeneratorPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <QuizGeneratorContent />
    </Suspense>
  )
}
