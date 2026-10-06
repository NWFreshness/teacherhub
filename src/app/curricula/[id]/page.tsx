import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/db"
import { CurriculumDetailClient } from "@/components/curriculum-detail-client"

async function getCurriculum(id: string, userId: string) {
  return prisma.curriculum.findUnique({
    where: { id },
    include: {
      saves: { where: { userId }, select: { userId: true } },
    },
  })
}

export default async function CurriculumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params
  const curriculum = await getCurriculum(id, session.user.id)

  const hidden = !curriculum || (!curriculum.isPublic && curriculum.userId !== session.user.id)

  if (!curriculum || hidden) {
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
        <CurriculumDetailClient
          curriculum={curriculum}
          saved={curriculum.saves.length > 0}
          owned={curriculum.userId === session.user.id}
        />
      </main>
    </div>
  )
}
