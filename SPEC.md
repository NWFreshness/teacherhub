# TeacherHub LMS - MVP Specification

## Project Overview

**Project Name:** TeacherHub LMS  
**Project Type:** Web Application (Learning Management Platform)  
**Core Functionality:** A teacher-focused platform for downloading pre-built curricula aligned to WA/OR Common Core standards and generating AI-powered quizzes from curriculum content.  
**Target Users:** K-12 teachers in Washington and Oregon states

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **AI:** OpenAI API (GPT-4o) via server-side API routes
- **Auth:** NextAuth.js v5 (Credentials provider + JWT)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Deployment:** Vercel-ready with Vercel Postgres support

---

## UI/UX Specification

### Color Palette

| Role | Color | Hex Code |
|------|-------|----------|
| Primary | Deep Indigo | `#4338CA` |
| Primary Hover | Indigo 700 | `#4F46E5` |
| Secondary | Warm Amber | `#F59E0B` |
| Secondary Hover | Amber 600 | `#D97706` |
| Background | Warm White | `#FAFAF9` |
| Surface | Pure White | `#FFFFFF` |
| Text Primary | Slate 900 | `#0F172A` |
| Text Secondary | Slate 600 | `#475569` |
| Text Muted | Slate 400 | `#94A3B8` |
| Border | Slate 200 | `#E2E8F0` |
| Success | Emerald 600 | `#059669` |
| Error | Rose 600 | `#E11D48` |

### Typography

- **Font Family:** `Inter` (Google Fonts) - clean, professional, highly legible
- **Headings:** 
  - H1: 32px, font-weight 700
  - H2: 24px, font-weight 600
  - H3: 20px, font-weight 600
- **Body:** 16px, font-weight 400
- **Small:** 14px, font-weight 400

### Spacing System

- Base unit: 4px
- Common spacings: 8px, 12px, 16px, 24px, 32px, 48px

### Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Layout Structure

#### Global Layout
- **Header:** Fixed top navigation with logo, nav links (Dashboard, Curricula, Quiz Generator), user menu
- **Main Content:** Centered container, max-width 1280px
- **Footer:** Minimal footer with copyright

#### Pages

1. **Login Page**
   - Centered card on gradient background
   - Email/password form
   - "Register" link for new teachers

2. **Dashboard**
   - Welcome message with teacher name
   - Quick stats cards (Total Curricula, Quizzes Generated, This Month)
   - Recent activity list
   - Quick action buttons

3. **Curriculum Hub**
   - Search bar with filters (subject, grade level)
   - Grid of curriculum cards (3 columns desktop, 2 tablet, 1 mobile)
   - Each card: Title, subject tag, grade range, download button
   - Curriculum detail modal with full content preview

4. **Quiz Generator**
   - Two-panel layout (or stacked on mobile)
   - Left: Curriculum selector or text paste area
   - Right: Quiz configuration (question count, difficulty, types)
   - Generate button with loading state
   - Results panel showing generated quiz with answer key

5. **My Resources**
   - Tabs: Saved Curricula | My Quizzes
   - List view with edit/delete actions

### Components

- **Button:** Primary (indigo), Secondary (amber), Outline, Ghost variants
- **Input:** Text, Email, Password with floating labels
- **Card:** White background, subtle shadow, rounded-lg
- **Badge:** Subject tags (Math=blue, Science=green, ELA=purple, Social Studies=orange)
- **Modal:** Centered overlay with backdrop blur
- **Toast:** Success/error notifications
- **Skeleton:** Loading placeholders

### Animations

- Page transitions: fade-in 200ms ease
- Button hover: scale 1.02, 150ms ease
- Card hover: shadow-lg, translateY(-2px), 200ms ease
- Loading spinner: pulse animation
- Toast slide-in from top-right

---

## Data Models

### User
```prisma
model User {
  id            String       @id @default(cuid())
  email         String       @unique
  password      String
  name          String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  curriculums   Curriculum[]
  quizzes       Quiz[]
}
```

### Curriculum
```prisma
model Curriculum {
  id            String   @id @default(cuid())
  title         String
  description   String?
  subject       String   // Math, Science, ELA, Social Studies
  gradeLevel    String   // K-5, 6-8, 9-12
  content       Json     // Flexible JSONB for curriculum data
  isPublic      Boolean  @default(true) // Pre-built vs user-created
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  quizzes       Quiz[]
}
```

### Quiz
```prisma
model Quiz {
  id            String     @id @default(cuid())
  title         String
  questions     Json       // Array of question objects
  curriculumId  String?
  curriculum    Curriculum? @relation(fields: [curriculumId], references: [id])
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
```

---

## Functionality Specification

### Authentication

1. **Registration**
   - Email, Password (min 8 chars), Name (optional)
   - Password hashed with bcrypt
   - Redirect to dashboard on success

2. **Login**
   - Email + Password
   - JWT token stored in HTTP-only cookie
   - Session persists 7 days

3. **Protected Routes**
   - All pages except /login, /register
   - Redirect to /login if unauthenticated

### Curriculum Hub

1. **Browse Curricula**
   - Fetch all public curricula from DB
   - Display in responsive grid
   - Show subject badge, grade level, title

2. **Search & Filter**
   - Text search on title/description
   - Filter by subject dropdown
   - Filter by grade level dropdown

3. **View Details**
   - Modal with full curriculum JSON preview
   - Copy content button

4. **Download**
   - Download as JSON file
   - Trigger browser download

### AI Quiz Generator

1. **Input Methods**
   - Select from saved curricula dropdown
   - Paste custom text in textarea

2. **Configuration**
   - Number of questions: 5, 10, 15, 20
   - Difficulty: Easy, Medium, Hard
   - Question types: Multiple Choice, Short Answer, Mixed

3. **Generation Process**
   - Send prompt to OpenAI API
   - Parse JSON response
   - Save quiz to DB
   - Display results with answer key

4. **Quiz Display**
   - Numbered questions
   - Multiple choice options (A, B, C, D)
   - Short answer input fields
   - Toggle answer key visibility

### Dashboard

1. **Stats Cards**
   - Total curricula saved
   - Quizzes generated (all time)
   - Quizzes generated (this month)

2. **Recent Activity**
   - Last 5 quizzes generated with dates

3. **Quick Actions**
   - "Generate New Quiz" button
   - "Browse Curricula" button

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Create new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Curricula
- `GET /api/curriculums` - List all public curricula
- `GET /api/curriculums/[id]` - Get single curriculum
- `POST /api/curriculums` - Create user curriculum
- `GET /api/curriculums/user` - Get user's saved curricula

### Quizzes
- `GET /api/quizzes` - List user's quizzes
- `GET /api/quizzes/[id]` - Get single quiz
- `POST /api/quizzes` - Save generated quiz
- `POST /api/generate-quiz` - Generate quiz via AI

---

## Sample Curricula (Seed Data)

1. **Mathematics Grade 6 - Algebra Basics** (WA Common Core)
2. **Science Grade 4 - Earth Science** (OR Common Core)
3. **ELA Grade 8 - Literary Analysis** (WA Common Core)
4. **Social Studies Grade 5 - Ancient Civilizations** (OR Common Core)
5. **Mathematics Grade 3 - Fractions** (WA Common Core)
6. **Science Grade 9 - Biology Fundamentals** (OR Common Core)

---

## Acceptance Criteria

### Authentication
- [ ] User can register with email/password
- [ ] User can login and receive JWT session
- [ ] Unauthenticated users redirected to login
- [ ] User can logout

### Curriculum Hub
- [ ] Displays grid of 6+ sample curricula
- [ ] Search filters work correctly
- [ ] Can view curriculum details in modal
- [ ] Can download curriculum as JSON

### Quiz Generator
- [ ] Can select curriculum or paste text
- [ ] Can configure question count, difficulty, types
- [ ] Loading state during generation
- [ ] Displays generated quiz with answer key
- [ ] Quiz saved to database

### Dashboard
- [ ] Shows correct stats for user
- [ ] Displays recent quiz history
- [ ] Quick action buttons work

### UI/UX
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states shown appropriately
- [ ] Error messages displayed clearly
- [ ] Professional, clean design

---

## Deployment

### Vercel Setup
1. Connect GitHub repository to Vercel
2. Add environment variables:
   - `DATABASE_URL` (Vercel Postgres)
   - `OPENAI_API_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
3. Deploy with default settings

### Local Development
```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```
