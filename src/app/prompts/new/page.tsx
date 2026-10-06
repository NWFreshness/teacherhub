import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { PromptForm } from "@/components/prompt-form"
import { prisma } from "@/lib/db"

export default async function NewPromptPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const curricula = await prisma.curriculum.findMany({
    where: {
      OR: [{ isPublic: true }, { userId: session.user.id }],
    },
    orderBy: { title: "asc" },
    select: { id: true, title: true, subject: true, gradeLevel: true },
  })

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
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Share a prompt</h1>
            <p className="text-slate-600 mt-1">
              Add the prompt text, then tag a curriculum, grade, subject, or purpose if it helps other teachers find it.
            </p>
          </div>
          <PromptForm curricula={curricula} />
        </div>
      </main>
    </div>
  )
}
