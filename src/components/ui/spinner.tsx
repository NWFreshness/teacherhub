import { cn } from "@/lib/utils"

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600",
        className
      )}
    />
  )
}

export { Spinner }
