# AI Tutor

A real-time AI teaching platform where learners pick a subject, choose a tutor voice, and learn through live voice conversations.

## Tech Stack

- **[Next.js 15](https://nextjs.org)** (App Router, Turbopack) + **React 19** + **TypeScript**
- **[Tailwind CSS 4](https://tailwindcss.com)** for styling
- **[Clerk](https://clerk.com)** for authentication and subscription billing
- **[Supabase](https://supabase.com)** for the database
- **[Vapi](https://vapi.ai)** for real-time voice AI
- **[Sentry](https://sentry.io)** for error monitoring

## Features

- Sign up / sign in with Clerk
- Subscription plans with Clerk Billing (`/subscription`)
- Plan-gated premium content (`/premium`)
- Subjects: maths, language, science, history, coding, economics

## Getting Started

### Prerequisites

- Node.js 20.9 or later
- npm

### Installation

```bash
git clone https://github.com/Sohad-Almadhoon/ai_tutor.git
cd ai_tutor
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

> In development, Clerk can run in keyless mode without keys. Production builds require real keys.

### Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |

## Billing Setup

1. In the [Clerk Dashboard](https://dashboard.clerk.com), enable **Billing** and connect Stripe.
2. Create plans under **Billing → Plans**. The premium page checks for a plan with the key `pro`.
