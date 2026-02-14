import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({
    user: {
      name: session.user.name,
      email: session.user.email,
    },
  })
}
