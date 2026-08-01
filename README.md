# Application Tracking System Deema/QSTP

A modern internship application portal for students, startups, and admins. Students can browse internships and apply with their resume and cover letter, startups can manage postings and review candidates, and admins can oversee applications and shortlists.

## Main Features

- Student internship browsing and application flow
- Startup internship creation and candidate review
- Admin dashboard for applications and shortlists
- AI-assisted internship content generation for startups

## Environment Variable

The app uses one required environment variable for the AI-assisted internship generation feature:

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```
inside env.local file

If this variable is not set, the app will still run, but the AI generation feature will be hidden.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file named `.env.local` in the project root and add:

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

3. Start the development server:

```bash
npm run dev
```

4. Open the local URL shown in the terminal.

## Build for Production

```bash
npm run build
```