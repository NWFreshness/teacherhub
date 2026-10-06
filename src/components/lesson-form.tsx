"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

const selectClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"

interface CurriculumOption {
  id: string
  title: string
}

interface PromptOption {
  id: string
  title: string
  curriculumId: string | null
}

export function LessonForm({
  curricula,
  prompts,
  initialCurriculumId = "",
  initialPromptId = "",
}: {
  curricula: CurriculumOption[]
  prompts: PromptOption[]
  initialCurriculumId?: string
  initialPromptId?: string
}) {
  const router = useRouter()
  const [curriculumId, setCurriculumId] = useState(initialCurriculumId)
  const [promptId, setPromptId] = useState(initialPromptId)
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePromptChange = (value: string) => {
    setPromptId(value)
    const prompt = prompts.find((item) => item.id === value)
    if (prompt?.curriculumId && !curriculumId) {
      setCurriculumId(prompt.curriculumId)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculumId, promptId, note }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Could not generate a lesson")
        return
      }
      router.push(`/lessons/${data.id}`)
      router.refresh()
    } catch {
      setError("Could not generate a lesson")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="curriculum">Curriculum</Label>
            <select
              id="curriculum"
              value={curriculumId}
              onChange={(event) => setCurriculumId(event.target.value)}
              className={selectClass}
              required
            >
              <option value="">Choose a curriculum</option>
              {curricula.map((curriculum) => (
                <option key={curriculum.id} value={curriculum.id}>
                  {curriculum.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <select
              id="prompt"
              value={promptId}
              onChange={(event) => handlePromptChange(event.target.value)}
              className={selectClass}
              required
            >
              <option value="">Choose a prompt</option>
              {prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note for this lesson</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="45 minutes, no lab equipment"
            />
          </div>

          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Writing lesson..." : "Generate lesson"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
