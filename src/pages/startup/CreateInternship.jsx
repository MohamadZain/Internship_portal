import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Plus, Loader2, ArrowLeft, Send, Settings2 } from 'lucide-react';
import { db } from '@/api/base44Client';

import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';

const DEFAULT_OPTIONAL_FIELDS = [
  { key: 'cover_letter', label: 'Cover Letter', required: false, enabled: true },
  { key: 'portfolio', label: 'Portfolio', required: false, enabled: true },
  { key: 'linkedin', label: 'LinkedIn', required: false, enabled: true },
  { key: 'github', label: 'Github', required: false, enabled: true },
  { key: 'website', label: 'Website', required: false, enabled: true },
];

const MANDATORY_FIELDS = [
  { key: 'personal_information', label: 'Personal Information', required: true },
  { key: 'resume_upload', label: 'Resume / CV Upload', required: true },
  { key: 'description', label: 'Description', required: true },
];

const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
const toKey = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export default function CreateInternship() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', startup_name: '', responsibilities: '',
    requirements: '', duration: '', deadline: '', location: ''
  });

  const [optionalFields, setOptionalFields] = useState(DEFAULT_OPTIONAL_FIELDS);
  const [customFieldInput, setCustomFieldInput] = useState('');
  const [customFieldRequired, setCustomFieldRequired] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [customQuestionInput, setCustomQuestionInput] = useState('');
  const [customQuestionRequired, setCustomQuestionRequired] = useState(true);
  const [customQuestions, setCustomQuestions] = useState([]);

  const enabledOptionalFields = useMemo(() => optionalFields.filter((field) => field.enabled), [optionalFields]);
  const removedOptionalFields = useMemo(() => optionalFields.filter((field) => !field.enabled), [optionalFields]);

  const addSkill = () => {
    const value = skillInput.trim();
    if (value && !skills.includes(value)) {
      setSkills([...skills, value]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

  const toggleOptionalRequired = (fieldKey) => {
    setOptionalFields((prev) => prev.map((field) => (
      field.key === fieldKey ? { ...field, required: !field.required } : field
    )));
  };

  const removeOptionalField = (fieldKey) => {
    setOptionalFields((prev) => prev.map((field) => (
      field.key === fieldKey ? { ...field, enabled: false } : field
    )));
  };

  const restoreOptionalField = (fieldKey) => {
    setOptionalFields((prev) => prev.map((field) => (
      field.key === fieldKey ? { ...field, enabled: true } : field
    )));
  };

  const addCustomField = () => {
    const label = customFieldInput.trim();
    if (!label) return;
    setCustomFields((prev) => [
      ...prev,
      {
        id: makeId('custom_field'),
        key: toKey(label) || makeId('field'),
        label,
        required: customFieldRequired,
      },
    ]);
    setCustomFieldInput('');
    setCustomFieldRequired(false);
  };

  const removeCustomField = (id) => setCustomFields((prev) => prev.filter((field) => field.id !== id));

  const toggleCustomFieldRequired = (id) => {
    setCustomFields((prev) => prev.map((field) => (
      field.id === id ? { ...field, required: !field.required } : field
    )));
  };

  const addCustomQuestion = () => {
    const question = customQuestionInput.trim();
    if (!question) return;
    setCustomQuestions((prev) => [
      ...prev,
      {
        id: makeId('custom_question'),
        question,
        required: customQuestionRequired,
      },
    ]);
    setCustomQuestionInput('');
    setCustomQuestionRequired(true);
  };

  const removeCustomQuestion = (id) => setCustomQuestions((prev) => prev.filter((question) => question.id !== id));

  const toggleCustomQuestionRequired = (id) => {
    setCustomQuestions((prev) => prev.map((question) => (
      question.id === id ? { ...question, required: !question.required } : question
    )));
  };

  const buildApplicationFormConfig = () => {
    const optional = enabledOptionalFields.map(({ key, label, required }) => ({ key, label, required }));
    const customFieldConfig = customFields.map(({ id, ...rest }) => rest);
    const customQuestionConfig = customQuestions.map(({ id, ...rest }) => rest);

    return {
      mandatory_fields: MANDATORY_FIELDS,
      optional_fields: optional,
      custom_fields: customFieldConfig,
      custom_questions: customQuestionConfig,
    };
  };

  const handleSubmit = async (submitForApproval) => {
    if (!form.title || !form.description || !form.startup_name) {
      toast({ title: 'Please fill in title, startup name, and description.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const applicationFormConfig = buildApplicationFormConfig();
      await db.entities.Internship.create({
        ...form,
        deadline: form.deadline || undefined,
        skills_required: skills,
        status: submitForApproval ? 'pending_approval' : 'draft',
        is_featured: false,
        application_form_config: applicationFormConfig,
        application_questions: applicationFormConfig.custom_questions,
      });
      toast({ title: submitForApproval ? 'Internship submitted for approval' : 'Draft saved' });
      navigate('/startup/internships');
    } catch {
      toast({ title: 'Failed to save internship', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Internship" description="Create a new internship posting and fully configure the student application form." />

      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title *"><input className="qstp-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Startup name *"><input className="qstp-input" value={form.startup_name} onChange={e => setForm({ ...form, startup_name: e.target.value })} /></Field>
          <Field label="Duration"><input className="qstp-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></Field>
          <Field label="Location"><input className="qstp-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Deadline"><input type="date" className="qstp-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></Field>
        </div>

        <div className="mt-4 space-y-4">
          <Field label="Description *"><textarea rows={4} className="qstp-input resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Responsibilities"><textarea rows={3} className="qstp-input resize-none" value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} /></Field>
          <Field label="Requirements"><textarea rows={3} className="qstp-input resize-none" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} /></Field>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Skills</label>
          <div className="flex gap-2">
            <input className="qstp-input" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill" />
            <button onClick={addSkill} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-muted">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/10">
                  {skill}
                  <button onClick={() => removeSkill(skill)}><X className="h-3.5 w-3.5" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-violet-600" />
          <h2 className="text-base font-semibold text-foreground">Application Form Configuration</h2>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">This configuration will be saved with the internship and used later to render the student application form exactly as defined.</p>

        <div className="space-y-5">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Mandatory Fields</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {MANDATORY_FIELDS.map((field) => (
                <div key={field.key} className="rounded-xl border border-border bg-muted/20 p-3">
                  <p className="text-sm font-medium text-foreground">{field.label}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-violet-700">Required</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Optional Fields</h3>
            {enabledOptionalFields.length === 0 ? (
              <p className="text-sm text-muted-foreground">No optional fields selected.</p>
            ) : (
              <div className="space-y-2">
                {enabledOptionalFields.map((field) => (
                  <div key={field.key} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-white px-3 py-2.5">
                    <p className="text-sm font-medium text-foreground">{field.label}</p>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <input type="checkbox" checked={field.required} onChange={() => toggleOptionalRequired(field.key)} />
                        Required
                      </label>
                      <button onClick={() => removeOptionalField(field.key)} className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {removedOptionalFields.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-muted-foreground">Removed:</p>
                {removedOptionalFields.map((field) => (
                  <button key={field.key} onClick={() => restoreOptionalField(field.key)} className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/10">
                    + {field.label}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Other Custom Fields</h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input className="qstp-input" value={customFieldInput} onChange={(e) => setCustomFieldInput(e.target.value)} placeholder="e.g. Expected salary, Availability date" />
              <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <input type="checkbox" checked={customFieldRequired} onChange={(e) => setCustomFieldRequired(e.target.checked)} />
                Required
              </label>
              <button onClick={addCustomField} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-muted">
                <Plus className="h-4 w-4" /> Add Field
              </button>
            </div>
            {customFields.length > 0 && (
              <div className="space-y-2">
                {customFields.map((field) => (
                  <div key={field.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                    <p className="text-sm font-medium text-foreground">{field.label}</p>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <input type="checkbox" checked={field.required} onChange={() => toggleCustomFieldRequired(field.id)} />
                        Required
                      </label>
                      <button onClick={() => removeCustomField(field.id)} className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Custom Application Questions</h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input className="qstp-input" value={customQuestionInput} onChange={(e) => setCustomQuestionInput(e.target.value)} placeholder="Add application question..." />
              <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <input type="checkbox" checked={customQuestionRequired} onChange={(e) => setCustomQuestionRequired(e.target.checked)} />
                Mandatory
              </label>
              <button onClick={addCustomQuestion} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-muted">
                <Plus className="h-4 w-4" /> Add Question
              </button>
            </div>
            {customQuestions.length > 0 && (
              <div className="space-y-2">
                {customQuestions.map((question) => (
                  <div key={question.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                    <p className="text-sm font-medium text-foreground">{question.question}</p>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <input type="checkbox" checked={question.required} onChange={() => toggleCustomQuestionRequired(question.id)} />
                        Mandatory
                      </label>
                      <button onClick={() => removeCustomQuestion(question.id)} className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => handleSubmit(false)} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-60">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Draft
        </button>
        <button onClick={() => handleSubmit(true)} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit for Approval
        </button>
      </div>
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
