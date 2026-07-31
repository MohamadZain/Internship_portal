import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, Loader2, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/components/ui/use-toast';

const MOCK_CANDIDATES = [
  {
    name: 'Fatima Al-Marri',
    bullets: [
      'Built a React-based learning platform for her capstone project at Carnegie Mellon Qatar, used by 200+ students with a 4.8/5 satisfaction rating.',
      'Completed a summer internship at Ooredoo where she shipped customer-facing features in a production React and TypeScript codebase.',
      'Proficient in the exact technologies required — React, TypeScript, Tailwind CSS, and REST API integration — with clean, tested component architecture.',
      'Demonstrated ability to work in an agile team, participate in code reviews, and deliver features on schedule.',
    ],
  },
  {
    name: 'Sara Al-Sulaiti',
    bullets: [
      'Completed a research project on CNN-based pneumonia detection from chest X-rays, achieving 94% accuracy on a dataset of 5,000+ images.',
      'Strong PyTorch skills demonstrated through multiple Kaggle competitions, placing in the top 10% for medical image segmentation.',
      'Electrical engineering background provides the mathematical rigour needed for clinical ML work, including linear algebra and optimization.',
      'Familiar with the full ML pipeline — data preprocessing, model training, evaluation metrics, and experiment tracking.',
    ],
  },
  {
    name: 'Layla Al-Mansoori',
    bullets: [
      'Built and deployed a complete tutoring marketplace with React, Node.js, and PostgreSQL — handling authentication, payments, and real-time messaging.',
      'Designed and implemented a GraphQL API with proper schema design, resolver patterns, and N+1 query optimization.',
      'Passion for education technology aligns directly with the company mission, having tutored underprivileged students throughout university.',
      'Shipped production features in a team setting using Git workflows, code reviews, and CI/CD pipelines.',
    ],
  },
  {
    name: 'Mariam Al-Thani',
    bullets: [
      'Research assistantship analysing air quality data with Python and Pandas, building visualisation dashboards for environmental sensors.',
      'Strong SQL skills from coursework and a data engineering internship at Qatar Energy, querying datasets with millions of rows.',
      'Direct experience with time-series environmental data that is immediately transferable to the role\u2019s sensor analytics work.',
      'Statistics major with deep understanding of hypothesis testing, regression analysis, and data quality assessment.',
    ],
  },
  {
    name: 'Ahmed Al-Kuwari',
    bullets: [
      'Built a budgeting app with React and Tailwind CSS as a personal project, demonstrating clean UI implementation and state management.',
      'Computer engineering background gives him strong fundamentals in algorithms, data structures, and systems thinking.',
      'Consistent GitHub contributions show a self-driven learning approach and growing proficiency in modern frontend development.',
      'Would benefit from mentorship but shows strong potential in the exact technologies the role requires.',
    ],
  },
  {
    name: 'Yusuf Rahman',
    bullets: [
      'Built a course scheduling application at Carnegie Mellon Qatar using React and Node.js with a PostgreSQL backend.',
      'Information systems major with solid understanding of database design, normalization, and query optimization.',
      'Academic projects demonstrate good full-stack architecture knowledge — API design, authentication flows, and responsive UI.',
      'Strong communication skills from group projects and a consulting club, fitting well in a collaborative team environment.',
    ],
  },
  {
    name: 'Noura Al-Boainin',
    bullets: [
      'Strong visual design portfolio from Virginia Commonwealth University Qatar, showcasing branding and UI work in Figma.',
      'Self-directed project redesigning a local delivery app — created user flows, wireframes, and interactive prototypes.',
      'Excellent craft in typography, colour theory, and layout, with an eye for clean, accessible interfaces.',
      'Transitioning into UX with growing user research skills — conducted 5+ user interviews for her delivery app redesign.',
    ],
  },
  {
    name: 'Omar Hassan',
    bullets: [
      'Built a sentiment analysis project using scikit-learn and NLTK, processing 10,000+ Arabic and English product reviews.',
      'Strong Python fundamentals with coursework in data structures, algorithms, and introductory machine learning.',
      'Enthusiasm for healthcare applications, with a clear motivation to grow into deep learning and computer vision.',
      'Would need ramp-up time on PyTorch but shows the analytical mindset and work ethic to succeed in the role.',
    ],
  },
  {
    name: 'Khalid Al-Mohannadi',
    bullets: [
      'Developed a real-time chat application using Socket.io and Node.js, handling 500+ concurrent connections.',
      'Experience with Docker and basic AWS deployment from a DevOps internship at Qatar Computing Research Institute.',
      'Strong understanding of REST API design, database modelling, and authentication patterns.',
      'Active in the Qatar developer community, having presented at two local tech meetups.',
    ],
  },
  {
    name: 'Haya Al-Naimi',
    bullets: [
      'Built an AR mobile app prototype using Unity and AR Foundation for a campus navigation project.',
      'Coursework in computer graphics, human-computer interaction, and mobile development.',
      'Experience with React Native for cross-platform development, having published a study timer app.',
      'Strong design sensibility combined with technical implementation skills.',
    ],
  },
  {
    name: 'Abdullah Al-Subaie',
    bullets: [
      'Internship at Baladna building automation scripts with Python that reduced manual data entry by 40%.',
      'Experience with SQL, Power BI, and Excel for business intelligence reporting.',
      'Coursework in statistics, operations research, and supply chain management.',
      'Strong problem-solving skills and a proven track record of delivering measurable efficiency improvements.',
    ],
  },
  {
    name: 'Reem Al-Kuwari',
    bullets: [
      'Built a blockchain-based certificate verification system as a final-year project using Solidity and React.',
      'Experience with smart contract development, testing, and deployment on Ethereum testnets.',
      'Strong understanding of cryptographic principles and distributed systems.',
      'Active contributor to open-source Web3 projects with 200+ GitHub stars on personal repos.',
    ],
  },
  {
    name: 'Saif Al-Dosari',
    bullets: [
      'Developed a computer vision pipeline for traffic sign recognition using OpenCV and TensorFlow.',
      'Achieved 91% accuracy on the German Traffic Sign Recognition Benchmark dataset.',
      'Experience with data augmentation, transfer learning, and model quantization for edge deployment.',
      'Strong mathematical foundation from a dual major in computer science and mathematics.',
    ],
  },
  {
    name: 'Dana Al-Emadi',
    bullets: [
      'UX research internship at Qatar National Library, conducting usability tests and synthesizing findings.',
      'Proficient in Figma, Adobe XD, and Maze for prototyping and user testing.',
      'Built a design system for a university club platform with 30+ reusable components.',
      'Strong ability to translate user research insights into actionable design decisions.',
    ],
  },
  {
    name: 'Tariq Al-Ansari',
    bullets: [
      'Built a Flutter e-commerce app with Firebase backend, handling 1,000+ downloads on Play Store.',
      'Experience with state management (BLoC pattern), REST APIs, and push notifications.',
      'Coursework in mobile development, databases, and software engineering.',
      'Strong product sense, having independently designed and shipped a complete mobile application.',
    ],
  },
  {
    name: 'Mona Al-Hajri',
    bullets: [
      'Data science internship at Hamad Medical Corporation, building predictive models for patient readmission.',
      'Experience with Python, scikit-learn, Pandas, and SQL for end-to-end data analysis.',
      'Achieved 87% accuracy on readmission prediction, presented findings to hospital leadership.',
      'Strong communication skills, able to translate technical results for non-technical stakeholders.',
    ],
  },
  {
    name: 'Jassim Al-Baker',
    bullets: [
      'Built a Kubernetes operator in Go for automated database backups at a DevOps internship.',
      'Experience with Docker, Kubernetes, Terraform, and CI/CD pipelines (GitHub Actions).',
      'Strong understanding of cloud infrastructure on AWS and Azure.',
      'Contributed to two open-source DevOps tools with merged pull requests.',
    ],
  },
  {
    name: 'Aisha Al-Sowaidi',
    bullets: [
      'Developed a React Native fitness tracking app with health kit integration and offline support.',
      'Experience with TypeScript, React Navigation, and Redux for state management.',
      'Coursework in mobile UX, data structures, and software testing.',
      'Shipped 3 app updates with bug fixes and new features based on user feedback.',
    ],
  },
  {
    name: 'Hamad Al-Marri',
    bullets: [
      'Built a Django-based inventory management system for his family\u2019s retail business.',
      'Experience with Python, Django REST Framework, PostgreSQL, and Redis caching.',
      'Implemented role-based access control and audit logging for the inventory system.',
      'Strong understanding of backend architecture, API design, and database optimization.',
    ],
  },
  {
    name: 'Latifa Al-Abdulla',
    bullets: [
      'NLP research project on Arabic sentiment analysis using transformers (AraBERT), achieving 89% F1 score.',
      'Experience with Hugging Face, PyTorch, and the full NLP pipeline — tokenization, fine-tuning, evaluation.',
      'Published a paper at a student research conference on Arabic language processing.',
      'Strong mathematical foundation in linear algebra, probability, and optimization.',
    ],
  },
];

export default function AnalyzeCandidates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [resumes, setResumes] = useState([]);
  const [topCount, setTopCount] = useState(5);
  const [analyzing, setAnalyzing] = useState(false);

  const handleJdFile = (file) => {
    if (!file) return;
    setJdFile(file);
  };

  const handleResumeSelect = (files) => {
    if (!files?.length) return;
    const newFiles = Array.from(files).map(f => ({ name: f.name, size: f.size }));
    setResumes(prev => [...prev, ...newFiles]);
  };

  const removeResume = (idx) => {
    setResumes(resumes.filter((_, i) => i !== idx));
  };

  const handleAnalyze = () => {
    if (!jdFile && !jdText.trim()) {
      toast({ title: 'Please upload a job description file or paste the text.', variant: 'destructive' });
      return;
    }
    if (resumes.length === 0) {
      toast({ title: 'Please upload at least one resume.', variant: 'destructive' });
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      const shuffled = [...MOCK_CANDIDATES].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(topCount, MOCK_CANDIDATES.length));
      navigate('/admin/top-candidates', { state: { candidates: selected, resumeCount: resumes.length } });
    }, 2500);
  };

  if (analyzing) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="relative">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30">
            <Sparkles className="h-9 w-9 text-white animate-pulse" />
          </div>
          <div className="absolute -inset-3 animate-ping rounded-3xl border-2 border-violet-400/30" />
        </div>
        <p className="mt-6 text-lg font-bold text-foreground">Deema AI is analyzing candidates…</p>
        <p className="mt-1 text-sm text-muted-foreground">Reading resumes, matching skills, and ranking top talent</p>
        <div className="mt-5 flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-2 w-2 animate-bounce rounded-full bg-violet-500" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyze Candidates"
        description="Upload a job description and candidate resumes for Deema AI to analyze and rank the best candidates."
      />

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Job Description */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Job Description</h3>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 transition hover:border-violet-300 hover:bg-violet-50/30">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
              <Upload className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Upload JD File</p>
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT</p>
            </div>
            {jdFile && (
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="max-w-[140px] truncate">{jdFile.name}</span>
              </span>
            )}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={e => handleJdFile(e.target.files?.[0])}
            />
          </label>

          {jdFile && (
            <button
              onClick={() => setJdFile(null)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-500"
            >
              <X className="h-3 w-3" /> Remove file
            </button>
          )}

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <textarea
            rows={6}
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder="Paste Job Description Here"
            className="qstp-input resize-none"
          />
        </div>

        {/* Candidate Resumes */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Candidate Resumes</h3>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-4 py-8 text-center transition hover:border-violet-300 hover:bg-violet-50/30">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="mt-2 text-sm font-medium text-foreground">Upload multiple resume files</span>
            <span className="text-xs text-muted-foreground">PDF, DOC, DOCX — select multiple files</span>
            <input
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={e => handleResumeSelect(e.target.files)}
            />
          </label>

          {resumes.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {resumes.length} {resumes.length === 1 ? 'File' : 'Files'} Selected
              </p>
              <div className="max-h-40 space-y-2 overflow-y-auto scrollbar-thin">
                {resumes.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm text-foreground truncate">
                      <FileText className="h-4 w-4 shrink-0 text-violet-500" />
                      <span className="truncate">{r.name}</span>
                    </span>
                    <button onClick={() => removeResume(idx)} className="text-muted-foreground hover:text-rose-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Candidates Count */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Number of Top Candidates</h3>
          <div className="relative">
            <select
              value={topCount}
              onChange={e => setTopCount(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-foreground outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            >
              {[5, 10, 15, 20].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-700"
          >
            <Sparkles className="h-4 w-4" /> Analyze Candidates
          </button>
        </div>
      </div>
    </div>
  );
}