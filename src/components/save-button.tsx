"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SaveButton({
  kind,
  id,
  saved,
}: {
  kind: "curriculum" | "prompt"
  id: string
  saved: boolean
}) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(saved)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const res = await fetch("/api/saves", {
      method: isSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id }),
    })
    if (res.ok) {
      setIsSaved(!isSaved)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button
      type="button"
      variant={isSaved ? "secondary" : "outline"}
      onClick={toggle}
      disabled={loading}
      className="gap-2"
    >
      <Bookmark className="h-4 w-4" />
      {isSaved ? "Saved" : "Save"}
    </Button>
  )
}
