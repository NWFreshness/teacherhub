import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Filter, MessageSquare, Plus, Search } from "lucide-react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/db"
import { SaveButton } from "@/components/save-button"
import {
  GRADE_LEVELS,
  PURPOSES,
  SUBJECTS,
  gradeLabel,
  subjectColors,
} from "@/lib/prompt-options"

async function getPrompts(options: {
  userId: string
  search?: string
  subject?: string
  gradeLevel?: string
  purpose?: string
  mine?: boolean
}) {
  const filters: Record<string, unknown>[] = [
    options.mine
      ? {
          OR: [
            { userId: options.userId },
            { saves: { some: { userId: options.userId } } },
          ],
        }
      : { isPublic: true },
  ]

  if (options.search) {
    filters.push({
      OR: [
        { title: { contains: options.search } },
        { description: { contains: options.search } },
        { body: { contains: options.search } },
      ],
    })
  }
  if (options.subject) filters.push({ subject: options.subject })
  if (options.gradeLevel) filters.push({ gradeLevel: options.gradeLevel })
  if (options.purpose) filters.push({ purpose: options.purpose })

  return prisma.prompt.findMany({
    where: { AND: filters },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      curriculum: { select: { title: true } },
      saves: { where: { userId: options.userId }, select: { userId: true } },
    },
  })
}

const selectClass =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    subject?: string
    grade?: string
    purpose?: string
    mine?: string
  }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const params = await searchParams
  const mine = params.mine === "1"
  const prompts = await getPrompts({
    userId: session.user.id,
    search: params.search,
    subject: params.subject,
    gradeLevel: params.grade,
    purpose: params.purpose,
    mine,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {mine ? "My prompts" : "Prompt Library"}
              </h1>
              <p className="text-slate-600 mt-1">
                {mine
                  ? "Prompts you created or saved from the hub"
                  : "Browse the full shared catalog, then save the ones you want in your library"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={mine ? "/prompts" : "/prompts?mine=1"}>
                <Button variant="outline">{mine ? "Full hub" : "My library"}</Button>
              </Link>
              <Link href="/prompts/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Share a prompt
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form className="flex flex-col lg:flex-row gap-4">
                {mine && <input type="hidden" name="mine" value="1" />}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    name="search"
                    placeholder="Search prompts..."
                    defaultValue={params.search || ""}
                    className="pl-10"
                  />
                </div>
                <select name="subject" defaultValue={params.subject || ""} className={selectClass}>
                  <option value="">All subjects</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <select name="grade" defaultValue={params.grade || ""} className={selectClass}>
                  <option value="">All grades</option>
                  {GRADE_LEVELS.map((grade) => (
                    <option key={grade} value={grade}>
                      {gradeLabel(grade)}
                    </option>
                  ))}
                </select>
                <select name="purpose" defaultValue={params.purpose || ""} className={selectClass}>
                  <option value="">All purposes</option>
                  {PURPOSES.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </form>
            </CardContent>
          </Card>

          {prompts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No prompts found</h3>
                <p className="text-slate-500 mb-4">
                  {mine ? "Save a prompt from the hub, or share one of your own." : "Try another search, or share the first one."}
                </p>
                <Link href="/prompts/new">
                  <Button>Share a prompt</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex flex-wrap items-start gap-2">
                      {prompt.subject && (
                        <Badge variant={subjectColors[prompt.subject] || "default"}>{prompt.subject}</Badge>
                      )}
                      {prompt.gradeLevel && (
                        <Badge variant="outline">{gradeLabel(prompt.gradeLevel)}</Badge>
                      )}
                      {prompt.purpose && <Badge variant="secondary">{prompt.purpose}</Badge>}
                      {!prompt.isPublic && <Badge variant="warning">Private</Badge>}
                      {prompt.userId === session.user.id && <Badge variant="secondary">Yours</Badge>}
                      {prompt.userId !== session.user.id && prompt.saves.length > 0 && (
                        <Badge variant="secondary">Saved</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{prompt.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {prompt.description || prompt.body}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>{prompt.user.name || "Teacher"}</p>
                      {prompt.aiTool && <p>Written for {prompt.aiTool}</p>}
                      {prompt.curriculum && <p>For {prompt.curriculum.title}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/prompts/${prompt.id}`} className="flex-1">
                        <Button className="w-full">View prompt</Button>
                      </Link>
                      {prompt.userId !== session.user.id && (
                        <SaveButton kind="prompt" id={prompt.id} saved={prompt.saves.length > 0} />
                      )}
                    </div>
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
