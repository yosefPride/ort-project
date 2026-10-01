import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { useGet } from './hooks/useGet';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import IssuePage from './pages/IssuePage';
import IssuesPage from './pages/IssuesPage';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import TeamPage from './pages/TeamPage';

export default function App() {
  const { data: me, isPending } = useGet('/auth/me');

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      {/* Everything below needs a signed-in user; signed-out visitors go to /login. */}
      <Route element={me ? <AppLayout me={me} /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<DashboardPage me={me} />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/issues/:issueId" element={<IssuePage me={me} />} />
        <Route path="/teams/:teamId" element={<TeamPage me={me} />} />
        <Route path="/account" element={<AccountPage me={me} />} />
        <Route path="/admin" element={me?.is_admin ? <AdminPage me={me} /> : <Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<NotFound me={me} />} />
    </Routes>
  );
}
