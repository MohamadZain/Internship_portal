import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Clock, MapPin, Calendar, CheckCircle2,
  Upload, Linkedin, Github, Globe, Loader2, X
} from 'lucide-react';
import { db } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

import { useToast } from '@/components/ui/use-toast';
import Loading from '@/components/Loading';
import StatusBadge from '@/components/StatusBadge';

const LEGACY_OPTIONAL_KEYS = new Set(['linkedin', 'github', 'portfolio', 'cover_letter']);

export default function InternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [applicationDescription, setApplicationDescription] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    university: '',
    major: '',
    linkedin: '',
    github: '',
    portfolio: '',
    website: '',
    cover_letter: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      email: user.email || prev.email || '',
    }));
  }, [user]);

  useEffect(() => {
    db.entities.Internship.get(id).then(d => { setInternship(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const applicationConfig = internship?.application_form_config || null;
  const hasConfiguredForm = Boolean(applicationConfig?.mandatory_fields);

  const mandatoryKeys = useMemo(() => (
    new Set((applicationConfig?.mandatory_fields || []).map((field) => field.key))
  ), [applicationConfig]);

  const optionalFieldMap = useMemo(() => {
    const map = new Map();
    (applicationConfig?.optional_fields || []).forEach((field) => {
      map.set(field.key, field);
    });
    return map;
  }, [applicationConfig]);

  const customFields = useMemo(() => applicationConfig?.custom_fields || [], [applicationConfig]);
  const customQuestions = useMemo(() => applicationConfig?.custom_questions || [], [applicationConfig]);

  const showOptionalField = (key) => {
    if (!hasConfiguredForm) return LEGACY_OPTIONAL_KEYS.has(key);
    return optionalFieldMap.has(key);
  };

  const isOptionalRequired = (key) => {
    if (!hasConfiguredForm) return false;
    return Boolean(optionalFieldMap.get(key)?.required);
  };

  const showConfiguredDescription = hasConfiguredForm && mandatoryKeys.has('description');
  const showConfiguredCoverLetter = hasConfiguredForm && showOptionalField('cover_letter');
  const showLegacyUniversityMajor = !hasConfiguredForm;

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

  const validateConfiguredFields = () => {
    if (showConfiguredDescription && !applicationDescription.trim()) {
      toast({ title: 'Description is required for this application.', variant: 'destructive' });
      return false;
    }

    const optionalRequiredChecks = ['portfolio', 'linkedin', 'github', 'website', 'cover_letter'];
    for (const key of optionalRequiredChecks) {
      if (showOptionalField(key) && isOptionalRequired(key) && !String(form[key] || '').trim()) {
        const label = (optionalFieldMap.get(key)?.label || key).replace(/_/g, ' ');
        toast({ title: `${label} is required for this application.`, variant: 'destructive' });
        return false;
      }
    }

    for (const field of customFields) {
      if (field.required && !String(customFieldValues[field.key] || '').trim()) {
        toast({ title: `${field.label} is required.`, variant: 'destructive' });
        return false;
      }
    }

    for (const question of customQuestions) {
      if (question.required && !String(questionAnswers[question.id] || '').trim()) {
        toast({ title: 'Please answer all mandatory custom questions.', variant: 'destructive' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !resumeUrl) {
      toast({ title: 'Please fill your name, email, and upload a resume.', variant: 'destructive' });
      return;
    }
    if (hasConfiguredForm && !validateConfiguredFields()) {
      return;
    }

    setSubmitting(true);
    try {
      const existingApplications = await db.entities.Application.filter({ internship_id: id }, '-created_date', 1000);
      const normalizedEmail = String(user?.email || form.email).trim().toLowerCase();
      const alreadyApplied = (existingApplications || []).some(
        (application) => String(application.student_email || '').trim().toLowerCase() === normalizedEmail
      );

      if (alreadyApplied) {
        toast({ title: 'You have already applied for this internship.', variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      const questionResponses = customQuestions.map((question) => ({
        question: question.question,
        answer: questionAnswers[question.id] || '',
        required: Boolean(question.required),
      }));

      const customFieldResponses = customFields.map((field) => ({
        key: field.key,
        label: field.label,
        value: customFieldValues[field.key] || '',
        required: Boolean(field.required),
      }));

      await db.entities.Application.create({
        internship_id: id,
        internship_title: internship.title,
        startup_id: internship.startup_id,
        startup_name: internship.startup_name,
        student_name: form.name,
        student_email: form.email,
        student_university: showLegacyUniversityMajor ? form.university : undefined,
        student_major: showLegacyUniversityMajor ? form.major : undefined,
        resume_url: resumeUrl,
        linkedin: showOptionalField('linkedin') ? form.linkedin : undefined,
        github: showOptionalField('github') ? form.github : undefined,
        portfolio: showOptionalField('portfolio') ? form.portfolio : undefined,
        website: showOptionalField('website') ? form.website : undefined,
        cover_letter: hasConfiguredForm ? (showConfiguredCoverLetter ? form.cover_letter : undefined) : form.cover_letter,
        application_description: showConfiguredDescription ? applicationDescription : undefined,
        application_answers: questionResponses,
        custom_field_answers: customFieldResponses,
        application_form_snapshot: hasConfiguredForm ? applicationConfig : undefined,
        status: 'applied',
      });
      console.log(await db.entities.Application);
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
                  <input className="qstp-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" disabled={Boolean(user?.email)} />
                </Field>
              </div>

              {showLegacyUniversityMajor && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="University">
                    <input className="qstp-input" value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} placeholder="e.g. Carnegie Mellon Qatar" />
                  </Field>
                  <Field label="Major">
                    <input className="qstp-input" value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} placeholder="e.g. Computer Science" />
                  </Field>
                </div>
              )}

              <Field label="Resume / CV *">
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

              {showConfiguredDescription && (
                <Field label="Description *">
                  <textarea rows={3} className="qstp-input resize-none" value={applicationDescription} onChange={e => setApplicationDescription(e.target.value)} placeholder="Describe your fit for this internship..." />
                </Field>
              )}

              {showConfiguredCoverLetter && (
                <Field label={`Cover Letter${isOptionalRequired('cover_letter') ? ' *' : ''}`}>
                  <textarea rows={3} className="qstp-input resize-none" value={form.cover_letter} onChange={e => setForm({ ...form, cover_letter: e.target.value })} placeholder="Write a cover letter..." />
                </Field>
              )}

              {!hasConfiguredForm && (
                <Field label="Cover letter">
                  <textarea rows={3} className="qstp-input resize-none" value={form.cover_letter} onChange={e => setForm({ ...form, cover_letter: e.target.value })} placeholder="Tell us why you're a great fit…" />
                </Field>
              )}

              {showOptionalField('linkedin') && (
                <Field label={`LinkedIn${isOptionalRequired('linkedin') ? ' *' : ''}`}>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input className="qstp-input pl-9" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="linkedin.com/in/username" />
                  </div>
                </Field>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {showOptionalField('github') && (
                  <Field label={`Github${isOptionalRequired('github') ? ' *' : ''}`}>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input className="qstp-input pl-9" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} placeholder="github.com/username" />
                    </div>
                  </Field>
                )}
                {showOptionalField('portfolio') && (
                  <Field label={`Portfolio${isOptionalRequired('portfolio') ? ' *' : ''}`}>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input className="qstp-input pl-9" value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} placeholder="portfolio url" />
                    </div>
                  </Field>
                )}
              </div>

              {showOptionalField('website') && (
                <Field label={`Website${isOptionalRequired('website') ? ' *' : ''}`}>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input className="qstp-input pl-9" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yourwebsite.com" />
                  </div>
                </Field>
              )}

              {customFields.map((field) => (
                <Field key={field.key} label={`${field.label}${field.required ? ' *' : ''}`}>
                  <input className="qstp-input" value={customFieldValues[field.key] || ''} onChange={e => setCustomFieldValues({ ...customFieldValues, [field.key]: e.target.value })} placeholder={field.label} />
                </Field>
              ))}

              {customQuestions.map((question) => (
                <Field key={question.id} label={`${question.question}${question.required ? ' *' : ''}`}>
                  <textarea rows={3} className="qstp-input resize-none" value={questionAnswers[question.id] || ''} onChange={e => setQuestionAnswers({ ...questionAnswers, [question.id]: e.target.value })} placeholder="Your answer..." />
                </Field>
              ))}
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
