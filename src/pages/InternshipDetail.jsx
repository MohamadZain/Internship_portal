const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Clock, MapPin, Calendar, CheckCircle2,
  Upload, Linkedin, Github, Globe, Loader2, X
} from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import Loading from '@/components/Loading';
import StatusBadge from '@/components/StatusBadge';

export default function InternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', university: '', major: '', linkedin: '', github: '', portfolio: '', cover_letter: '' });

  useEffect(() => {
    db.entities.Internship.get(id).then(d => { setInternship(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleResumeUpload = async (file) => {
    if (!file) return;
    setUploadingResume(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setResumeUrl(file_url);
      toast({ title: 'Resume uploaded' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !resumeUrl) {
      toast({ title: 'Please fill your name, email, and upload a resume.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await db.entities.Application.create({
        internship_id: id,
        internship_title: internship.title,
        startup_id: internship.startup_id,
        startup_name: internship.startup_name,
        student_name: form.name,
        student_email: form.email,
        student_university: form.university,
        student_major: form.major,
        resume_url: resumeUrl,
        linkedin: form.linkedin,
        github: form.github,
        portfolio: form.portfolio,
        cover_letter: form.cover_letter,
        status: 'applied',
      });
      toast({ title: 'Application submitted!', description: 'The startup and QSTP will review your application.' });
      setApplyOpen(false);
      navigate('/applications');
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!internship) return (
    <div className="py-20 text-center">
      <p className="text-muted-foreground">Internship not found.</p>
      <Link to="/internships" className="mt-3 inline-block text-sm font-medium text-violet-600">Back to internships</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link to="/internships" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to internships
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{internship.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />{internship.startup_name}</span>
                  {internship.duration && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{internship.duration}</span>}
                  {internship.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{internship.location}</span>}
                </div>
              </div>
              <StatusBadge status={internship.status} />
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-foreground">About the role</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{internship.description}</p>
            </div>

            {internship.responsibilities && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-foreground">Responsibilities</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{internship.responsibilities}</p>
              </div>
            )}

            {internship.requirements && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-foreground">Requirements</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{internship.requirements}</p>
              </div>
            )}

            {internship.skills_required?.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-foreground">Skills required</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {internship.skills_required.map(s => (
                    <span key={s} className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/10">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">Apply now</h3>
            <p className="mt-1 text-sm text-muted-foreground">Submit your application with your resume and portfolio links.</p>
            {internship.deadline && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-inset ring-amber-600/10">
                <Calendar className="h-3.5 w-3.5" /> Deadline: {new Date(internship.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}
            <button
              onClick={() => setApplyOpen(true)}
              className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Apply for this internship
            </button>
          </div>
        </div>
      </div>

      {/* Apply Dialog */}
      {applyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setApplyOpen(false)} />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-bold text-foreground">Apply: {internship.title}</h2>
              <button onClick={() => !submitting && setApplyOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full name *">
                  <input className="qstp-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </Field>
                <Field label="Email *">
                  <input className="qstp-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="University">
                  <input className="qstp-input" value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} placeholder="e.g. Carnegie Mellon Qatar" />
                </Field>
                <Field label="Major">
                  <input className="qstp-input" value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} placeholder="e.g. Computer Science" />
                </Field>
              </div>

              <Field label="Resume *">
                {resumeUrl ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Resume uploaded</span>
                    <button onClick={() => setResumeUrl('')} className="text-xs text-emerald-700 underline">Replace</button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center transition hover:border-violet-300 hover:bg-violet-50/30">
                    {uploadingResume ? <Loader2 className="h-5 w-5 animate-spin text-violet-500" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                    <span className="mt-2 text-sm font-medium text-foreground">{uploadingResume ? 'Uploading…' : 'Click to upload resume'}</span>
                    <span className="text-xs text-muted-foreground">PDF, DOC, DOCX</span>
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => handleResumeUpload(e.target.files?.[0])} disabled={uploadingResume} />
                  </label>
                )}
              </Field>

              <Field label="LinkedIn">
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input className="qstp-input pl-9" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="linkedin.com/in/username" />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="GitHub">
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input className="qstp-input pl-9" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} placeholder="github.com/username" />
                  </div>
                </Field>
                <Field label="Portfolio">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input className="qstp-input pl-9" value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} placeholder="yoursite.com" />
                  </div>
                </Field>
              </div>
              <Field label="Cover letter">
                <textarea rows={3} className="qstp-input resize-none" value={form.cover_letter} onChange={e => setForm({ ...form, cover_letter: e.target.value })} placeholder="Tell us why you're a great fit…" />
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button onClick={() => setApplyOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted" disabled={submitting}>Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}