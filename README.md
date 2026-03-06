# DevTrackr

This repository contains the source code for DevTrackr, an advanced AI-powered developer portfolio analytics SaaS. DevTrackr integrates with GitHub to deliver personalized, interactive insights to developers, offering tailored productivity scores, contribution analysis, and real-time neural performance reports.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Machine Learning Models](#machine-learning-models)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About the Project

DevTrackr is a Developer Analytics platform that turns raw GitHub data into beautiful, actionable visualizations. It provides a comprehensive dashboard for tracking commits, pull requests, and repository activity, helping developers showcase their impact and optimize their workflow through AI-driven insights.

## Features

- **Live GitHub Sync**: Seamlessly syncs repositories, commits, and PR data directly from GitHub via Clerk OAuth.
- **Analytics Dashboard**: Visualizes contribution patterns, language distribution, and activity trends using Recharts.
- **Neural Productivity Scoring**: Calculates a custom performance score based on commits, merged PRs, and repository impact.
- **AI-Powered Insights**: Generates professional, crisp productivity reports using Google Gemini 2.5 Flash.
- **Repository Analysis**: Detailed deep-dives into individual project statistics and commit heatmaps.

## Technologies Used

- **FastAPI**: High-performance Python backend for data processing and API routes.
- **React.js (with TypeScript)**: Modern frontend framework for a responsive, premium dashboard experience.
- **Prisma**: Type-safe ORM for PostgreSQL database management.
- **Google Gemini API**: Powers the neural analytics and productivity report generation.
- **Clerk**: Secure authentication and GitHub OAuth integration.
- **Tailwind CSS**: Utility-first CSS framework for sleek, modern UI design.
- **Recharts**: For interactive and dynamic data visualizations.
- **Vercel Analytics**: Built-in monitoring for frontend performance.
- **SlowAPI**: Rate limiting for API protection.

## Installation

To set up DevTrackr locally, follow these steps:

### Backend Setup
1. **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2. **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: .\venv\Scripts\activate
    ```
3. **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4. **Configure Environment Variables**: Create a `.env` file in the `backend` folder:
    ```env
    DATABASE_URL=your_postgres_url
    CLERK_SECRET_KEY=your_clerk_secret_key
    CLERK_WEBHOOK_SECRET=your_webhook_secret
    GEMINI_API_KEY=your_gemini_api_key
    ALLOWED_ORIGINS=http://localhost:5173, https://your-deployed-url.com
    ```
5. **Run Migrations**:
    ```bash
    prisma generate
    prisma db push
    ```
6. **Start the server**:
    ```bash
    uvicorn app:app --reload
    ```

### Frontend Setup
1. **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```
2. **Install dependencies**:
    ```bash
    npm install
    ```
3. **Configure Environment Variables**: Create a `.env.local` file in the `frontend` folder:
    ```env
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
    VITE_API_URL=http://localhost:8000
    ```
4. **Start the development server**:
    ```bash
    npm run dev
    ```

## Usage

- **Sign In**: Connect your GitHub account via Clerk.
- **Sync Data**: Click the "Sync" button to fetch your latest repositories, commits, and PRs.
- **Explore Insights**: View your productivity score and AI-generated performance reports on the dashboard.
- **Analyze Repos**: Drill down into specific repositories to see detailed activity heatmaps.

## Machine Learning Models

DevTrackr utilizes state-of-the-art AI to deliver contextual and professional developer analysis:

### Conversational & Analysis Models
- **Google Gemini API (`gemini-2.5-flash`)**: Used for generating concise, professional productivity summaries. It analyzes 30-day activity streams to provide senior-level engineering feedback directly to the user.

These models enable DevTrackr to:
- Synthesize complex GitHub activity into simple, actionable insights.
- Provide encouraging, data-driven performance reviews.
- Maintain a high level of professional language in automated reports.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request.

## License

DevTrackr is licensed under the MIT License.

## Contact
For any questions or feedback, please reach out to:

**Name**: Saumili Haldar  
**Email**: haldar.saumili843@gmail.com