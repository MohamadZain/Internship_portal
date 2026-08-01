import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useEntityList } from '@/lib/useEntityList';
import PageHeader from '@/components/PageHeader';
import InternshipCard from '@/components/InternshipCard';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';

export default function Internships() {
  const { data, loading } = useEntityList('Internship', { filter: { status: 'published' }, sort: '-created_date' });
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('all');
  const [internshipType, setInternshipType] = useState('all');
  const [degreeType, setDegreeType] = useState('all');
  const [academicYear, setAcademicYear] = useState('all');

  const allSkills = useMemo(() => {
    const set = new Set();
    (data || []).forEach(i => i.skills_required?.forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return (data || []).filter(i => {
      const matchesQuery = !query ||
        i.title?.toLowerCase().includes(query.toLowerCase()) ||
        i.startup_name?.toLowerCase().includes(query.toLowerCase()) ||
        i.description?.toLowerCase().includes(query.toLowerCase());
      const matchesSkill = skill === 'all' || i.skills_required?.includes(skill);
      const matchesInternshipType = internshipType === 'all' || i.internship_type === internshipType;
      const matchesDegreeType = degreeType === 'all' || i.degree_type === degreeType;
      const matchesAcademicYear = academicYear === 'all' || i.academic_year === academicYear;
      return matchesQuery && matchesSkill && matchesInternshipType && matchesDegreeType && matchesAcademicYear;
    });
  }, [data, query, skill, internshipType, degreeType, academicYear]);

  return (
    <div className="space-y-6">
      <PageHeader title="Browse Internships" description="Explore opportunities from innovative QSTP startups and apply with your portfolio." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, startup, or keyword…"
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={skill}
            onChange={e => setSkill(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 pl-10 pr-8 text-sm shadow-sm outline-none transition focus:border-violet-400 sm:w-56"
          >
            <option value="all">All skills</option>
            {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <select value={internshipType} onChange={e => setInternshipType(e.target.value)} className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 px-3 text-sm shadow-sm outline-none transition focus:border-violet-400 sm:w-44">
          <option value="all">All internship types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </select>
        <select value={degreeType} onChange={e => setDegreeType(e.target.value)} className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 px-3 text-sm shadow-sm outline-none transition focus:border-violet-400 sm:w-40">
          <option value="all">All degrees</option>
          <option value="Bachelor's">Bachelor's</option>
          <option value="Master's">Master's</option>
          <option value="PhD">PhD</option>
        </select>
        <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 px-3 text-sm shadow-sm outline-none transition focus:border-violet-400 sm:w-44">
          <option value="all">All academic years</option>
          {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Fresh Graduate'].map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No internships found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{filtered.length} internship{filtered.length !== 1 ? 's' : ''} available</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(i => <InternshipCard key={i.id} internship={i} />)}
          </div>
        </>
      )}
    </div>
  );
}