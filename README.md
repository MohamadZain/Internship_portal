# QSTP Talent – AI-Powered Applicant Tracking System (ATS)

An AI-powered Applicant Tracking System (ATS) developed for the *Build for QSTP Hackathon* to streamline internship recruitment across the Qatar Science & Technology Park (QSTP) ecosystem.

The platform centralizes the entire recruitment workflow—from internship creation to AI-assisted candidate shortlisting—through dedicated dashboards for Students, Startups, and QSTP Administrators.

---

## Team

- Mohamad Zain
- Muzayyan Parkar
- Esmaeil Mahmoodi
- Farid Abdul Rehman

---

## Challenge

*Challenge 2 – AI-Powered Applicant Tracking System (ATS)*

---

## Features

### Student Portal

- Browse approved internship opportunities
- Search and filter internships
- Apply using resume and cover letter
- Track application status
- Receive shortlist notifications

---

### Startup Dashboard

- Create internship postings
- Define eligibility requirements
- Manage internship listings
- View shortlisted candidates
- Download shortlisted resumes

---

### QSTP Admin Dashboard

- Manage startup companies
- Approve internship postings
- Review applications
- Filter candidates
- AI-assisted candidate analysis using Deema AI
- Generate internship-specific shortlists
- Approve or reject shortlisted candidates
- Publish shortlisted candidates to startups
- Export applications as CSV
- Download applicant resumes

---

## Bonus Features

### AI Internship Description Generator

Automatically generates:

- Internship Description
- Responsibilities
- Requirements

based on the internship title.

---

### AI Cover Letter Likelihood Analysis

Analyzes submitted cover letters and displays an AI-generated likelihood score indicating whether the content was likely generated using AI.

---

## Workflow

1. Startup creates an internship.
2. QSTP reviews and approves the internship.
3. Internship is published.
4. Students browse internships.
5. Students submit applications.
6. QSTP reviews applications.
7. Recruiters filter candidates.
8. Recruiters select the Top N applicants.
9. Deema AI generates candidate summaries.
10. QSTP reviews AI-generated summaries.
11. Recruiters approve or reject candidates.
12. Shortlists are published to startups.

---

## Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Router

### Backend

- Node.js
- Express.js

### AI

- Mocked Deema AI Integration
- OpenRouter API (Bonus Features)

### Data

- Local Mock Database
- CSV Export
- ZIP Resume Download

---

## Project Structure


src/
├── components/
├── pages/
├── entities/
├── layouts/
├── hooks/
├── utils/
└── App.jsx


---

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
   http://localhost:5173


---

## Future Roadmap

- Production Deema AI integration
- Resume parsing
- LinkedIn internship publishing
- Email notifications
- Authentication with QSTP SSO
- Interview scheduling (Challenge 3)
- Alumni engagement integration (Challenge 1)

---

## Notes

This project was developed as a *hackathon prototype*.

Some AI features use mocked responses to demonstrate the intended production workflow while maintaining an architecture that supports future integration with Deema AI.

---

## License

Developed for the *Build for QSTP Hackathon 2026*. farid check this out asap



```bash
npm run build
```
