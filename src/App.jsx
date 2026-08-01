import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RoleProvider } from '@/lib/RoleContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Internships from '@/pages/Internships';
import InternshipDetail from '@/pages/InternshipDetail';
import Applications from '@/pages/Applications';
import Notifications from '@/pages/Notifications';
import StartupInternships from '@/pages/startup/StartupInternships';
import CreateInternship from '@/pages/startup/CreateInternship';
import ShortlistedCandidates from '@/pages/startup/ShortlistedCandidates';
import StartupManagement from '@/pages/admin/StartupManagement';
import InternshipApproval from '@/pages/admin/InternshipApproval';
import AdminApplications from '@/pages/admin/Applications';
import ApplicationDetails from '@/pages/admin/ApplicationDetails';
import AnalyzeCandidates from '@/pages/admin/AnalyzeCandidates';
import TopCandidates from '@/pages/admin/TopCandidates';
import Shortlists from '@/pages/admin/Shortlists';
import ShortlistDetail from '@/pages/admin/ShortlistDetail';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/internships/:id" element={<InternshipDetail />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/startup/internships" element={<StartupInternships />} />
          <Route path="/startup/create-internship" element={<CreateInternship />} />
          <Route path="/startup/shortlisted" element={<ShortlistedCandidates />} />
          <Route path="/admin/startups" element={<StartupManagement />} />
          <Route path="/admin/internship-approval" element={<InternshipApproval />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/applications/:id" element={<ApplicationDetails />} />
          <Route path="/admin/analyze-candidates" element={<AnalyzeCandidates />} />
          <Route path="/admin/top-candidates" element={<TopCandidates />} />
          <Route path="/admin/shortlists" element={<Shortlists />} />
          <Route path="/admin/shortlists/:id" element={<ShortlistDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <RoleProvider>
            <AuthenticatedApp />
          </RoleProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App