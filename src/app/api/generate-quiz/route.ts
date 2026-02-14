import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, curriculumId, questionCount, difficulty, questionTypes, title } = body

    if (!content || !questionCount || !difficulty || !questionTypes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Build the prompt for OpenAI
    const questionTypeText = questionTypes === "mixed" 
      ? "multiple choice and short answer"
      : questionTypes

    const prompt = `You are an expert educator. Create a ${questionCount}-question ${difficulty} difficulty quiz based on the following curriculum content.

Quiz Title: ${title || "Generated Quiz"}

Content to generate questions from:
${content}

Requirements:
- Generate exactly ${questionCount} questions
- Difficulty level: ${difficulty}
- Question types: ${questionTypeText}
- For multiple choice: provide 4 options (A, B, C, D) with one correct answer
- For short answer: provide a model answer
- Format your response as a JSON array with this exact structure:
[
  {
    "type": "multiple_choice" or "short_answer",
    "question": "The question text",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"] (only for multiple choice),
    "correctAnswer": "The correct answer" (for multiple choice: "A", "B", "C", or "D"; for short answer: the model answer),
    "explanation": "Brief explanation of why this is the answer"
  }
]

Return ONLY the JSON array, no other text.`

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are an expert educator creating quiz questions. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content

    if (!responseText) {
      return NextResponse.json(
        { error: "Failed to generate quiz" },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let questions
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        questions = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError)
      return NextResponse.json(
        { error: "Failed to parse quiz questions" },
        { status: 500 }
      )
    }

    // Save the quiz to the database
    const quiz = await prisma.quiz.create({
      data: {
        title: title || `Quiz - ${new Date().toLocaleDateString()}`,
        questions: JSON.stringify(questions),
        curriculumId: curriculumId || null,
        userId: session.user.id,
      }
    })

    // Return with parsed questions for display
    return NextResponse.json({
      ...quiz,
      questions: questions
    })
  } catch (error) {
    console.error("Error generating quiz:", error)
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    )
  }
}
