import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, Mail, GraduationCap, User } from 'lucide-react';
import { db } from '@/api/base44Client';

import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';

function normalizeDocuments(application) {
  const raw =
    application.uploaded_documents ||
    application.documents ||
    application.attachments ||
    application.files ||
    [];

  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return Object.values(raw);
  return [];
}

function normalizeAnswers(application) {
  const raw =
    application.application_answers ||
    application.answers ||
    application.question_answers ||
    application.screening_answers ||
    [];

  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    return Object.entries(raw).map(([question, answer]) => ({ question, answer }));
  }
  return [];
}

function isLikelyUrl(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value);
}

export default function ApplicationDetails() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    db.entities.Application.get(id)
      .then((result) => {
        if (isMounted) setApplication(result);
      })
      .catch(() => {
        if (isMounted) setApplication(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const documents = useMemo(() => (application ? normalizeDocuments(application) : []), [application]);
  const answers = useMemo(() => (application ? normalizeAnswers(application) : []), [application]);

  if (loading) return <Loading />;

  if (!application) {
    return (
      <div className="space-y-6">
        <PageHeader title="Application Details" description="View complete candidate application information." />
        <EmptyState icon={FileText} title="Application not found" description="This application may have been removed or is no longer available.">
          <Link to="/admin/applications" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            <ArrowLeft className="h-4 w-4" /> Back to Applications
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Application Details" description="Review applicant profile, documents, and question responses." />

      <Link to="/admin/applications" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to applications
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-foreground">Candidate Profile</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem icon={User} label="Student Name" value={application.student_name || 'Not provided'} />
              <InfoItem icon={Mail} label="Email" value={application.student_email || 'Not provided'} />
              <InfoItem icon={GraduationCap} label="University" value={application.student_university || 'Not provided'} />
              <InfoItem icon={GraduationCap} label="Degree" value={application.student_major || application.degree || 'Not provided'} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-foreground">Answers to Application Questions</h2>
            {answers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No answers submitted.</p>
            ) : (
              <div className="space-y-3">
                {answers.map((item, index) => {
                  const question = item.question || item.prompt || `Question ${index + 1}`;
                  const answer = item.answer || item.response || item.value || String(item);
                  return (
                    <div key={`${question}-${index}`} className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{question}</p>
                      <p className="mt-1 text-sm text-foreground">{answer || 'No answer provided'}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Application Status</h2>
            <StatusBadge status={application.status || 'applied'} />
            <p className="mt-3 text-xs text-muted-foreground">Internship: {application.internship_title || 'Not provided'}</p>
            <p className="text-xs text-muted-foreground">Startup: {application.startup_name || 'Not provided'}</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Resume</h2>
            {application.resume_url ? (
              <a href={application.resume_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700">
                <ExternalLink className="h-4 w-4" /> Open Resume
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No resume uploaded.</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Uploaded Documents</h2>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No extra documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, index) => {
                  const label = doc?.name || doc?.title || `Document ${index + 1}`;
                  const url = typeof doc === 'string' ? doc : doc?.url || doc?.file_url || doc?.link;
                  return (
                    <div key={`${label}-${index}`} className="rounded-lg bg-muted/40 p-2.5">
                      {url && isLikelyUrl(url) ? (
                        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700">
                          <ExternalLink className="h-4 w-4" /> {label}
                        </a>
                      ) : (
                        <p className="text-sm text-foreground">{label}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
