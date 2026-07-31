const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Plus, Loader2, ArrowLeft, Send } from 'lucide-react';

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
      toast({ title: submitForApproval ? 'Internship submitted for approval' : 'Draft saved', description: submitForApproval ? 'QSTP will review your posting.' : undefined });