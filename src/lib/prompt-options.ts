export const SUBJECTS = ["Math", "Science", "ELA", "Social Studies"] as const

export const GRADE_LEVELS = [
  "K",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
] as const

export const PURPOSES = [
  "Lesson planning",
  "Differentiation",
  "Student feedback",
  "Assessment",
  "Parent communication",
  "Classroom activity",
] as const

export const AI_TOOLS = ["ChatGPT", "Claude", "Gemini", "Copilot", "Any tool"] as const

export const subjectColors: Record<string, "math" | "science" | "ela" | "social"> = {
  Math: "math",
  Science: "science",
  ELA: "ela",
  "Social Studies": "social",
}

export function gradeLabel(gradeLevel: string) {
  return gradeLevel === "K" ? "Kindergarten" : `Grade ${gradeLevel}`
}
