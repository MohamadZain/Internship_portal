import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Plus, Loader2, ArrowLeft, Send } from 'lucide-react';
import { db } from '@/api/base44Client';

import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';

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

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(''); }
  };

  const handleSubmit = async (submitForApproval) => {
    if (!form.title || !form.description || !form.startup_name) {
      toast({ title: 'Please fill in title, startup name, and description.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await db.entities.Internship.create({
        ...form,
        deadline: form.deadline || undefined,
        skills_required: skills,
        status: submitForApproval ? 'pending_approval' : 'draft',
        is_featured: false,
      });
      toast({ title: submitForApproval ? 'Internship submitted for approval' : 'Draft saved' });
      navigate('/startup/internships');
    } catch {
      toast({ title: 'Failed to save internship', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

  return (
    <div className="space-y-6">
      <PageHeader title="Create Internship" description="Create a new internship posting for review and publishing." />

      <Link to="/startup/internships" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to internships
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

        <div className="mt-6 flex justify-end gap-2">
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
