# 🚀 DevTrackr: 4-Week Execution Plan

Here is a structured, week-by-week roadmap to build the DevTrackr Developer Portfolio Analytics SaaS. It is designed to logically introduce you to the tech stack (Vite + React, TSX, Python FastAPI, Clerk, Prisma, TailwindCSS) while minimizing overwhelming jumps in difficulty.

---

## 📅 Week 1: Foundation & Auth (The "SaaS Skeleton")

**Objective:** Set up the Vite + React scaffolding, backend service, implement authentication, and prepare the database.

*   **Day 1: Project Setup & Vite (React + TSX)**
    *   Initialize the frontend project using `npm create vite@latest . -- --template react-ts`.
    *   Initialize a separate Python FastAPI backend for your API routes.
    *   Set up Tailwind CSS, formatting (Prettier, ESLint).
    *   Build a visually appealing but simple landing page showcasing the value prop ("Developer Analytics").
*   **Day 2: Clerk Authentication Integration**
    *   Register a [Clerk](https://clerk.com/) account and connect the React app using `@clerk/clerk-react`.
    *   Configure **GitHub OAuth login**.
    *   Protect specific frontend routes (e.g., `/dashboard`) using Clerk's `<SignedIn>` components so unauthenticated users cannot access them.
*   **Day 3-4: PostgreSQL & Prisma Setup**
    *   Set up a PostgreSQL database (cloud via Supabase, Neon, or Railway to avoid local Docker setup).
    *   Initialize Prisma (`npx prisma init`) and outline the base schema mapping to User and Clerk ID.
    *   Create migrations and seed any basic data to test locally.
*   **Day 5: Webhook & User Syncing**
    *   Implement Clerk webhooks using Svix to automatically sync `user.created` events into your Prisma `User` table.
    *   Ensure whenever a user joins or updates their GitHub login, your database mirrors the metadata.

---

## 📅 Week 2: GitHub API & Data Syncing (The "Data Engine")

**Objective:** Get external data from GitHub and sync it to your database via API routes.

*   **Day 1-2: Integrating the GitHub REST/GraphQL API**
    *   Use GitHub API documentation to fetch a user's repositories, commit history, and PRs.
    *   Build a simple wrapper class in your backend service to pull data using the OAuth token.
*   **Day 3: Synchronous Data Fetching (Simple Approach)**
    *   Instead of complex background jobs, implement an `async` function inside a standard API route that fetches GitHub data.
    *   Trigger this API manually (e.g., a "Sync Data" button on the frontend) or during initial login.
    *   Handle API rate limits gracefully by fetching only the most recent or necessary data first.
*   **Day 4-5: Ingesting to DB & Schematizing**
    *   Take the exact schema we designed mapping Commits, PullRequests, and Repositories.
    *   Update your data fetching logic to upsert (update/insert) records sequentially into Postgres using Prisma.
    *   Avoid duplicate commit saves by indexing commit `sha` hashes.
    *   *Goal checkpoint:* The database fills with analytics after triggering a sync route.

---

## 📅 Week 3: Analytics Engine & Dashboard (The "UI/UX Wow Factor")

**Objective:** Turn raw database records into beautiful visualizations.

*   **Day 1: Analytics Processing Engine**
    *   Write utility functions using Prisma `.groupBy()` and raw SQL queries if needed.
    *   Calculate metrics: *Lines of code, PR Merge Rate, Most Used Languages, Best Working Days (weekend vs weekday)*.
*   **Day 2: Dashboard Layout & Navigation**
    *   Build the core Dashboard layout (Sidebar, Header, Profile summary).
    *   Pull user configuration and basic numbers to show in metric cards.
*   **Day 3-4: Data Visualization (Recharts/Tremor)**
    *   Integrate a chart library like [Recharts](https://recharts.org/) or [Tremor](https://www.tremor.so/) (which comes with fantastic Tailwind integration).
    *   Create the "Contribution Heatmap" (similar to GitHub).
    *   Create the "Tech Stack Breakdown" pie chart.
    *   Create the "Activity Trends" line chart mapping Commits over time.
*   **Day 5: Productivity Score Algorithm**
    *   Invent a custom scoring algorithm based on PRs pushed and lines committed.
    *   Surface this score uniquely on the dashboard with a dynamic progress ring.

---

## 📅 Week 4: AI Insights, Polish & Deployment (The "Showcase")

**Objective:** Add finishing, CV-worthy touches, AI analysis, and take the project live.

*   **Day 1-2: AI Insight Generator (The "Cherry on Top")**
    *   Use the OpenAI or Google Gemini SDK.
    *   Query the user's weekly metrics, format them efficiently into a prompt: *"You are a senior tech lead. Based on this JSON data about a user's GitHub activity, generate 3 specific, encouraging insights about their productivity."*
    *   Save these insights into the `Insight` Prisma model and display them on the top of the dashboard.
*   **Day 3: Simple Caching & Rate Limiting (Performance Hardening)**
    *   Implement simple in-memory caching (e.g., `fastapi-cache` or `dogpile.cache`) to keep dashboard queries snappy without needing Redis.
    *   Implement rate limiting on the API routes (e.g., `slowapi`) to avoid abuse on expensive AI or GitHub API calls.
*   **Day 4: Deployment (PaaS Approach)**
    *   Rely on managed services to avoid manual containerization.
    *   Deploy the PostgreSQL instance (e.g., Supabase/Railway).
    *   Deploy the Vite + React frontend to Vercel/Netlify, and the Python FastAPI backend to Render/Railway or Heroku.
*   **Day 5: Final Polish for CV & Portfolios**
    *   Fill the `README.md` with beautiful screenshots, setup instructions, and architecture diagrams.
    *   Write the CV blurb highlighting *what* you achieved and *how* you built the data aggregation architecture.
    *   Post on LinkedIn / Twitter & Add to Portfolio!
