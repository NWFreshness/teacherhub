import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/db"
import { CurriculumDetailClient } from "@/components/curriculum-detail-client"

async function getCurriculum(id: string) {
  return await prisma.curriculum.findUnique({
    where: { id },
  })
}

export default async function CurriculumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params
  const curriculum = await getCurriculum(id)

  if (!curriculum) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold text-slate-900">Curriculum not found</h2>
              <Link href="/curricula">
                <Button variant="link" className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Curricula
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
      <main className="container mx-auto px-4 py-8">
        <CurriculumDetailClient curriculum={curriculum} />
      </main>
    </div>
  )
}
