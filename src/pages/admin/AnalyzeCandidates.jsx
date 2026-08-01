import { Navigate } from 'react-router-dom';

// Deema AI shortlisting is now fully integrated into the Applications page.
// This route is kept so existing links don't break, and redirects there.
export default function AnalyzeCandidates() {
  return <Navigate to="/admin/applications" replace />;
}
