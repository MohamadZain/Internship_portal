import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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

const INTERNSHIP_TYPES = ['Full-time', 'Part-time'];
const DEGREE_TYPES = ["Bachelor's", "Master's", 'PhD'];
const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Fresh Graduate'];

const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
const toKey = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export default function CreateInternship() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [loadingInternship, setLoadingInternship] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', startup_name: '', responsibilities: '',
    requirements: '', duration: '', deadline: '', location: '',
    internship_type: '', degree_type: '', academic_year: ''
  });

  const [optionalFields, setOptionalFields] = useState(DEFAULT_OPTIONAL_FIELDS);
  const [customFieldInput, setCustomFieldInput] = useState('');
  const [customFieldRequired, setCustomFieldRequired] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [customQuestionInput, setCustomQuestionInput] = useState('');
  const [customQuestionRequired, setCustomQuestionRequired] = useState(true);
  const [customQuestions, setCustomQuestions] = useState([]);
  const editInternshipId = searchParams.get('edit');

  const enabledOptionalFields = useMemo(() => optionalFields.filter((field) => field.enabled), [optionalFields]);
  const removedOptionalFields = useMemo(() => optionalFields.filter((field) => !field.enabled), [optionalFields]);

  useEffect(() => {
    if (!editInternshipId) return;
    let mounted = true;
    setLoadingInternship(true);
    db.entities.Internship.get(editInternshipId)
      .then((internship) => {
        if (!mounted) return;
        setForm({
          title: internship.title || '',
          description: internship.description || '',
          startup_name: internship.startup_name || '',
          responsibilities: internship.responsibilities || '',
          requirements: internship.requirements || '',
          duration: internship.duration || '',
          deadline: internship.deadline || '',
          location: internship.location || '',
          internship_type: internship.internship_type || '',
          degree_type: internship.degree_type || '',
          academic_year: internship.academic_year || '',
        });
        setSkills(Array.isArray(internship.skills_required) ? internship.skills_required : []);

        const config = internship.application_form_config || {};
        const optionalFromConfig = Array.isArray(config.optional_fields) ? config.optional_fields : [];
        const customFieldsFromConfig = Array.isArray(config.custom_fields) ? config.custom_fields : [];
        const customQuestionsFromConfig = Array.isArray(config.custom_questions) ? config.custom_questions : [];

        const mergedOptionalFields = DEFAULT_OPTIONAL_FIELDS.map((field) => {
          const configured = optionalFromConfig.find((item) => item.key === field.key);
          if (!configured) return { ...field, enabled: false, required: false };
          return {
            ...field,
            enabled: true,
            required: Boolean(configured.required),
            label: configured.label || field.label,
          };
        });

        setOptionalFields(mergedOptionalFields);
        setCustomFields(
          customFieldsFromConfig.map((field) => ({
            id: makeId('custom_field'),
            key: field.key || makeId('field'),
            label: field.label || 'Custom field',
            required: Boolean(field.required),
          }))
        );
        setCustomQuestions(
          customQuestionsFromConfig.map((question) => ({
            id: makeId('custom_question'),
            question: question.question || 'Custom question',
            required: Boolean(question.required),
          }))
        );
      })
      .catch(() => {
        if (!mounted) return;
        toast({ title: 'Failed to load internship for editing', variant: 'destructive' });
      })
      .finally(() => {
        if (mounted) setLoadingInternship(false);
      });

    return () => {
      mounted = false;
    };
  }, [editInternshipId, toast]);

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
    if (!form.title || !form.description || !form.internship_type || !form.degree_type || !form.academic_year) {
      if (!form.title || !form.description) {
        toast({ title: 'Please fill in title and description.', variant: 'destructive' });
        return;
      }
      if (!form.internship_type) {
        toast({ title: 'Internship type is required.', variant: 'destructive' });
        return;
      }
      if (!form.degree_type) {
        toast({ title: 'Degree type is required.', variant: 'destructive' });
        return;
      }
      if (!form.academic_year) {
        toast({ title: 'Academic year is required.', variant: 'destructive' });
      }
      return;
    }

    setSubmitting(true);
    try {
      const applicationFormConfig = buildApplicationFormConfig();
      const payload = {
        ...form,
        deadline: form.deadline || undefined,
        skills_required: skills,
        is_featured: false,
        application_form_config: applicationFormConfig,
        application_questions: applicationFormConfig.custom_questions,
      };

      if (editInternshipId) {
        const existing = await db.entities.Internship.get(editInternshipId);
        await db.entities.Internship.update(editInternshipId, {
          ...payload,
          status: submitForApproval ? 'pending_approval' : (existing?.status || 'draft'),
        });
      } else {
        await db.entities.Internship.create({
          ...payload,
          status: submitForApproval ? 'pending_approval' : 'draft',
        });
      }
      toast({ title: submitForApproval ? 'Internship submitted for approval' : (editInternshipId ? 'Internship updated' : 'Draft saved') });
      navigate('/startup/internships');
    } catch {
      toast({ title: 'Failed to save internship', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const [generatingDescription, setGeneratingDescription] = useState(false);

  const generateDescription = async () => {
    const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
    setGeneratingDescription(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content: `You are an expert HR assistant. Based on the provided info, generate a description, responsibilities, requirements, and a list of relevant skills for an internship. Return ONLY a valid JSON object with NO markdown formatting. The JSON must have exactly four keys: 'description' (string), 'responsibilities' (string), 'requirements' (string), and 'skills' (array of strings). Info: title: ${form.title}, startup name: ${form.startup_name}, duration: ${form.duration}`,
            },
            {
              role: "user",
              content: "Write a short professional description, the responsibilities, the requirements, and relevant skills for this internship position. Output ONLY valid JSON without any surrounding text or markdown code blocks.",
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      let content = data.choices[0].message.content;

      // Clean up potential markdown formatting if the model still includes it
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const parsed = JSON.parse(content);

      setForm((prev) => ({
        ...prev,
        description: parsed.description || prev.description,
        responsibilities: parsed.responsibilities || prev.responsibilities,
        requirements: parsed.requirements || prev.requirements,
      }));

      if (parsed.skills && Array.isArray(parsed.skills)) {
        setSkills((prevSkills) => {
          const newSkills = parsed.skills.filter((s) => !prevSkills.includes(s));
          return [...prevSkills, ...newSkills];
        });
      }
      
      toast({ title: 'Successfully generated content!' });
    } catch (error) {
      console.error("Failed to generate description:", error);
      toast({ title: 'Failed to generate description', description: error.message, variant: 'destructive' });
    } finally {
      setGeneratingDescription(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Internship" description="Create a new internship posting and fully configure the student application form." />

      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        {loadingInternship ? <p className="mb-4 text-sm text-muted-foreground">Loading internship details...</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title *"><input className="qstp-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Startup name"><input className="qstp-input" value={form.startup_name} onChange={e => setForm({ ...form, startup_name: e.target.value })} /></Field>
          <Field label="Internship Type *">
            <select className="qstp-input" value={form.internship_type} onChange={e => setForm({ ...form, internship_type: e.target.value })}>
              <option value="">Select internship type</option>
              {INTERNSHIP_TYPES.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Degree Type *">
            <select className="qstp-input" value={form.degree_type} onChange={e => setForm({ ...form, degree_type: e.target.value })}>
              <option value="">Select degree type</option>
              {DEGREE_TYPES.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Academic Year *">
            <select className="qstp-input" value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })}>
              <option value="">Select academic year</option>
              {ACADEMIC_YEARS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Duration"><input className="qstp-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></Field>
          <Field label="Location"><input className="qstp-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Deadline"><input type="date" className="qstp-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></Field>
        </div>

        <div className="mt-4 space-y-4">
          <Field
  label={
    <div className="flex items-center gap-2">
      <span>Description *</span>

    <button
  type="button"
  title={
    generatingDescription
      ? "AI is generating description..."
      : "Generate Description with AI"
  }
  onClick={generateDescription}
  disabled={generatingDescription}
  className="rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-600 transition-all duration-200 hover:border-purple-300 hover:bg-purple-100 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
>
  {generatingDescription ? (
    <span className="flex items-center gap-1.5">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
      Generating...
    </span>
  ) : (
    "✨ AI"
  )}
</button>
    </div>
  }
>
  <textarea
    rows={4}
    className="qstp-input resize-none"
    value={form.description}
    onChange={e =>
      setForm({ ...form, description: e.target.value })
    }
  />
</Field>
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
