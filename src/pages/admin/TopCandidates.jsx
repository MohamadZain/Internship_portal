import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Check, Loader2, ChevronDown, ArrowLeft, Award } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';

import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';

export default function TopCandidates() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const candidates = location.state?.candidates || [];
  const { data: internships } = useEntityList('Internship', { sort: '-created_date' });
  const { data: applications } = useEntityList('Application', { sort: '-created_date' });
  const [selected, setSelected] = useState(new Set(candidates.map((_, i) => i)));
  const [selectedInternship, setSelectedInternship] = useState('');
  const [publishing, setPublishing] = useState(false);

  const publishedInternships = internships.filter(i => i.status === 'published' || i.status === 'pending_approval' || i.status === 'closed');

  const toggle = (idx) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === candidates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(candidates.map((_, i) => i)));
    }
  };