import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PromptActions } from "@/components/prompt-actions"
import { SaveButton } from "@/components/save-button"
import { prisma } from "@/lib/db"
import { gradeLabel, subjectColors } from "@/lib/prompt-options"

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      curriculum: { select: { id: true, title: true } },
      saves: { where: { userId: session.user.id }, select: { userId: true } },
    },
  })

  const hidden = !prompt || (!prompt.isPublic && prompt.userId !== session.user.id)

  if (!prompt || hidden) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold text-slate-900">Prompt not found</h2>
              <Link href="/prompts">
                <Button variant="link" className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to prompts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6 animate-fade-in">
          <Link href="/prompts">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to prompts
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                {prompt.subject && (
                  <Badge variant={subjectColors[prompt.subject] || "default"}>{prompt.subject}</Badge>
                )}
                {prompt.gradeLevel && <Badge variant="outline">{gradeLabel(prompt.gradeLevel)}</Badge>}
                {prompt.purpose && <Badge variant="secondary">{prompt.purpose}</Badge>}
                {prompt.aiTool && <Badge variant="outline">{prompt.aiTool}</Badge>}
                {!prompt.isPublic && <Badge variant="warning">Private</Badge>}
              </div>
              <CardTitle className="text-2xl">{prompt.title}</CardTitle>
              <CardDescription className="text-base">
                Shared by {prompt.user.name || "a teacher"}
                {prompt.curriculum && (
                  <>
                    {" "}
                    for{" "}
                    <Link href={`/curricula/${prompt.curriculum.id}`} className="text-indigo-700 hover:underline">
                      {prompt.curriculum.title}
                    </Link>
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prompt.description && (
                <p className="text-slate-600 leading-relaxed">{prompt.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <PromptActions title={prompt.title} body={prompt.body} />
                {prompt.userId !== session.user.id && (
                  <SaveButton kind="prompt" id={prompt.id} saved={prompt.saves.length > 0} />
                )}
                <Link href={`/lessons/new?prompt=${prompt.id}${prompt.curriculum ? `&curriculum=${prompt.curriculum.id}` : ""}`}>
                  <Button variant="outline">Start a lesson</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-900 p-4 text-sm leading-relaxed text-slate-50 font-mono">
                {prompt.body}
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
