import Link from "next/link"
import { GraduationCap, BookOpen, Sparkles, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TeacherHub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </button>
            </Link>
            <Link href="/register">
              <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Your AI-Powered Teaching Assistant
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            TeacherHub makes teachers&apos; lives easier with a curriculum download hub aligned to WA/OR 
            Common Core standards and an AI-powered quiz generator that creates assessments in seconds.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register">
              <button className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all hover:scale-105">
                Start Free
              </button>
            </Link>
            <Link href="/login">
              <button className="text-sm font-semibold leading-6 text-slate-900">
                Sign in <span aria-hidden="true">→</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid max-w-lg mx-auto grid-cols-1 gap-8 sm:mt-16 lg:max-w-none lg:grid-cols-3">
          <div className="flex flex-col items-start rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Curriculum Hub</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Browse and download pre-built curricula aligned to Washington and Oregon Common Core standards. 
              Save your favorites for quick access.
            </p>
          </div>

          <div className="flex flex-col items-start rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Sparkles className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">AI Quiz Generator</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select any curriculum or paste your own content, choose question types and difficulty, 
              and let AI create a complete quiz with answer key.
            </p>
          </div>

          <div className="flex flex-col items-start rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Teacher-Focused</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Built specifically for K-12 teachers. Simple, intuitive, and designed to save you time 
              on lesson planning and assessment creation.
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
            <span className="font-medium">Demo:</span>
            teacher@demo.com / teacher123
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/50 py-8">
        <div className="container mx-auto text-center text-sm text-slate-500">
          <p>&copy; 2026 TeacherHub. Built for educators.</p>
        </div>
      </footer>
    </div>
  )
}
