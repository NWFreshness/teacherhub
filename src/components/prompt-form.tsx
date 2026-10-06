"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  AI_TOOLS,
  GRADE_LEVELS,
  PURPOSES,
  SUBJECTS,
  gradeLabel,
} from "@/lib/prompt-options"

const selectClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"

interface CurriculumOption {
  id: string
  title: string
  subject: string
  gradeLevel: string
}

export function PromptForm({ curricula }: { curricula: CurriculumOption[] }) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [description, setDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [gradeLevel, setGradeLevel] = useState("")
  const [purpose, setPurpose] = useState("")
  const [aiTool, setAiTool] = useState("")
  const [curriculumId, setCurriculumId] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          description,
          subject,
          gradeLevel,
          purpose,
          aiTool,
          curriculumId,
          isPublic,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Could not save this prompt")
        return
      }
      router.push(`/prompts/${data.id}`)
      router.refresh()
    } catch {
      setError("Could not save this prompt")
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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Exit ticket for two-step equations"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Prompt</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Paste the prompt other teachers can copy into their AI tool..."
              className="min-h-48"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">How to use it</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional notes: when it works well, what to change, what to watch for."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className={selectClass}
              >
                <option value="">Any subject</option>
                {SUBJECTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <select
                id="grade"
                value={gradeLevel}
                onChange={(event) => setGradeLevel(event.target.value)}
                className={selectClass}
              >
                <option value="">Any grade</option>
                {GRADE_LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {gradeLabel(item)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <select
                id="purpose"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                className={selectClass}
              >
                <option value="">Any purpose</option>
                {PURPOSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tool">Written for</Label>
              <select
                id="tool"
                value={aiTool}
                onChange={(event) => setAiTool(event.target.value)}
                className={selectClass}
              >
                <option value="">Any AI tool</option>
                {AI_TOOLS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="curriculum">Curriculum</Label>
            <select
              id="curriculum"
              value={curriculumId}
              onChange={(event) => setCurriculumId(event.target.value)}
              className={selectClass}
            >
              <option value="">Not tied to a curriculum</option>
              {curricula.map((curriculum) => (
                <option key={curriculum.id} value={curriculum.id}>
                  {curriculum.title}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <span>
              Share with other teachers
              <span className="block text-slate-500">
                Leave this on to list the prompt in the hub. Turn it off to keep it on your account only.
              </span>
            </span>
          </label>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save prompt"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
