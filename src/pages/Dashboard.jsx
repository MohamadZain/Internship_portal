import { Link } from 'react-router-dom';
import { useRole } from '@/lib/RoleContext';
import { useEntityList } from '@/lib/useEntityList';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import StartupDashboard from '@/components/dashboards/StartupDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

export default function Dashboard() {
  const { role } = useRole();
  if (role === 'student') return <StudentDashboard />;
  if (role === 'startup') return <StartupDashboard />;
  return <AdminDashboard />;
}