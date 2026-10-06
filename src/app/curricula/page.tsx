import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Download, Search, Filter, GraduationCap } from "lucide-react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/db"
import { SaveButton } from "@/components/save-button"

async function getCurricula(options: {
  userId: string
  search?: string
  subject?: string
  gradeLevel?: string
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
      ],
    })
  }
  if (options.subject) filters.push({ subject: options.subject })
  if (options.gradeLevel) filters.push({ gradeLevel: options.gradeLevel })

  return prisma.curriculum.findMany({
    where: { AND: filters },
    orderBy: { createdAt: "desc" },
    include: {
      saves: { where: { userId: options.userId }, select: { userId: true } },
    },
  })
}

const subjectColors: Record<string, "math" | "science" | "ela" | "social"> = {
  Math: "math",
  Science: "science",
  ELA: "ela",
  "Social Studies": "social",
}

export default async function CurriculaPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; subject?: string; grade?: string; mine?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const params = await searchParams
  const mine = params.mine === "1"
  const curricula = await getCurricula({
    userId: session.user.id,
    search: params.search,
    subject: params.subject,
    gradeLevel: params.grade,
    mine,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {mine ? "My curricula" : "Curriculum Hub"}
              </h1>
              <p className="text-slate-600 mt-1">
                {mine
                  ? "Curricula you created or saved from the hub"
                  : "Browse the full shared catalog, then save the ones you want in your library"}
              </p>
            </div>
            <Link href={mine ? "/curricula" : "/curricula?mine=1"}>
              <Button variant="outline">{mine ? "Full hub" : "My library"}</Button>
            </Link>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <form className="flex flex-col md:flex-row gap-4">
                {mine && <input type="hidden" name="mine" value="1" />}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    name="search"
                    placeholder="Search curricula..."
                    defaultValue={params.search || ""}
                    className="pl-10"
                  />
                </div>
                <select
                  name="subject"
                  defaultValue={params.subject || ""}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">All Subjects</option>
                  <option value="Math">Math</option>
                  <option value="Science">Science</option>
                  <option value="ELA">ELA</option>
                  <option value="Social Studies">Social Studies</option>
                </select>
                <select
                  name="grade"
                  defaultValue={params.grade || ""}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">All Grades</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                </select>
                <Button type="submit" variant="secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {curricula.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <GraduationCap className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No curricula found</h3>
                <p className="text-slate-500">
                  {mine ? "Save a curriculum from the hub to keep it here." : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {curricula.map((curriculum) => (
                <Card key={curriculum.id} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant={subjectColors[curriculum.subject as keyof typeof subjectColors] || "default"}>
                        {curriculum.subject}
                      </Badge>
                      <Badge variant="outline">Grade {curriculum.gradeLevel}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{curriculum.title}</CardTitle>
                    {curriculum.userId === session.user.id && <Badge variant="secondary">Yours</Badge>}
                    {curriculum.userId !== session.user.id && curriculum.saves.length > 0 && (
                      <Badge variant="secondary">Saved</Badge>
                    )}
                    <CardDescription className="line-clamp-2">
                      {curriculum.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Link href={`/curricula/${curriculum.id}`} className="flex-1">
                      <Button className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    {curriculum.userId !== session.user.id && (
                      <SaveButton
                        kind="curriculum"
                        id={curriculum.id}
                        saved={curriculum.saves.length > 0}
                      />
                    )}
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
