"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const subjectColors: Record<string, "math" | "science" | "ela" | "social"> = {
  Math: "math",
  Science: "science",
  ELA: "ela",
  "Social Studies": "social",
}

interface CurriculumContent {
  standards?: string[]
  topics?: Array<{
    name: string
    content: string
    keyPoints?: string[]
  }>
  assessments?: string[]
}

interface CurriculumDetailClientProps {
  curriculum: {
    id: string
    title: string
    description: string | null
    subject: string
    gradeLevel: string
    content: string
  }
}

export function CurriculumDetailClient({ curriculum }: CurriculumDetailClientProps) {
  const content: CurriculumContent = typeof curriculum.content === 'string' 
    ? JSON.parse(curriculum.content) 
    : curriculum.content

  const handleDownload = () => {
    const dataStr = curriculum.content
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${curriculum.title.replace(/\s+/g, "-").toLowerCase()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/curricula">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Curricula
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={subjectColors[curriculum.subject as keyof typeof subjectColors] || "default"}>
                  {curriculum.subject}
                </Badge>
                <Badge variant="outline">Grade {curriculum.gradeLevel}</Badge>
              </div>
              <CardTitle className="text-2xl">{curriculum.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {curriculum.description}
              </CardDescription>
            </div>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download JSON
            </Button>
          </div>
        </CardHeader>
      </Card>

      {content.standards && content.standards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Standards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {content.standards.map((standard: string) => (
                <Badge key={standard} variant="secondary">
                  {standard}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {content.topics && content.topics.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Learning Topics</h2>
          {content.topics.map((topic, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{topic.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600 leading-relaxed">{topic.content}</p>
                {topic.keyPoints && topic.keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Key Points:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {topic.keyPoints.map((point, i) => (
                        <li key={i} className="text-slate-600">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {content.assessments && content.assessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggested Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {content.assessments.map((assessment, index) => (
                <li key={index} className="text-slate-600">{assessment}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Link href={`/quiz-generator?curriculum=${curriculum.id}`}>
          <Button className="gap-2">
            Generate Quiz from this Curriculum
          </Button>
        </Link>
      </div>
    </div>
  )
}
