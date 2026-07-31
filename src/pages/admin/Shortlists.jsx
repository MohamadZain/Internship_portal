import { useState, useMemo } from 'react';
import { ListChecks, Plus, Sparkles, X, Loader2, ExternalLink, Check } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';

import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';

export default function Shortlists() {
  const { data: shortlists, loading, reload } = useEntityList('Shortlist', { sort: '-created_date' });
  const { data: applications } = useEntityList('Application', { sort: '-created_date' });
  const { data: internships } = useEntityList('Internship', { sort: '-created_date' });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState('');
  const [selectedApps, setSelectedApps] = useState({});
  const [publishing, setPublishing] = useState(false);

  const publishedAppIds = useMemo(() => new Set((shortlists || []).map(s => s.application_id)), [shortlists]);

  const eligibleApps = useMemo(() => {
    return (applications || []).filter(a =>
      a.internship_id === selectedInternship &&
      !publishedAppIds.has(a.id) &&
      a.status !== 'rejected'
    );
  }, [applications, selectedInternship, publishedAppIds]);

  const toggleApp = (id) => {
    setSelectedApps(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id]; else next[id] = '';
      return next;
    });
  };

  const handlePublish = async () => {