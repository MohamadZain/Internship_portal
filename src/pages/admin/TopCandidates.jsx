import { Navigate, useParams } from 'react-router-dom';

// Top candidates are now reviewed on the Shortlist detail page.
// This route is kept so existing links don't break, and redirects there.
export default function TopCandidates() {
  const { id } = useParams();
  return <Navigate to={id ? `/admin/shortlists/${id}` : '/admin/shortlists'} replace />;
}
