import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BookOpen, Download, Search, Filter, GraduationCap } from "lucide-react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/db"

async function getCurricula(search?: string, subject?: string, gradeLevel?: string) {
  const where: Record<string, unknown> = { isPublic: true }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  if (subject) {
    where.subject = subject
  }

  if (gradeLevel) {
    where.gradeLevel = gradeLevel
  }

  return await prisma.curriculum.findMany({
    where,
    orderBy: { createdAt: "desc" },
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
  searchParams: Promise<{ search?: string; subject?: string; grade?: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const params = await searchParams
  const curricula = await getCurricula(params.search, params.subject, params.grade)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Curriculum Hub</h1>
              <p className="text-slate-600 mt-1">
                Browse and download pre-built curricula aligned to WA/OR Common Core
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <form className="flex flex-col md:flex-row gap-4">
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
                <p className="text-slate-500">Try adjusting your search or filters</p>
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
                    <CardDescription className="line-clamp-2">
                      {curriculum.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/curricula/${curriculum.id}`}>
                      <Button className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        View & Download
                      </Button>
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
