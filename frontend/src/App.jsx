import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Documentation from './pages/Documentation';
import Flows from './pages/Flows';
import Forms from './pages/Forms';
import Files from './pages/Files';
import FlowViewer from './pages/FlowViewer';
import FlowBuilder from './pages/FlowBuilder';
import DocumentViewer from './pages/DocumentViewer';
import DocumentForm from './pages/DocumentForm';
import ProjectDetail from './pages/ProjectDetail';
import Facilities from './pages/Facilities';
import FacilityDetail from './pages/FacilityDetail';
import FacilityForm from './pages/FacilityForm';
import AdminPanel from './pages/AdminPanel';
import UserManagement from './pages/UserManagement';
import PlatformLinks from './pages/PlatformLinks';
import Projects from './pages/Projects';
import ProjectLinks from './pages/ProjectLinks';
import NotFound from './pages/NotFound';

// Redirects an old dynamic route (e.g. /documentation/:id) to its new home
// (e.g. /sops/:id), preserving the :id — <Navigate> alone can't substitute
// params from the route it's replacing.
function LegacyIdRedirect({ to }) {
  const { id } = useParams();
  return <Navigate to={to.replace(':id', id)} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* SOPs and Flows are public — viewable without a session, and
                live at their own dedicated routes so they read as standalone
                pages linked from the landing page, not URLs borrowed from the
                authenticated app. Only creating/editing them requires auth
                (see the role-gated routes below). */}
            <Route path="/sops" element={<Documentation />} />
            <Route path="/sops/:id" element={<DocumentViewer />} />
            <Route path="/flow-manuals" element={<Flows />} />
            <Route path="/flow-manuals/view/:id" element={<FlowViewer />} />

            {/* Project detail pages — linked from the landing page's Projects
                & Contributions section, public like SOPs/Flows. */}
            <Route path="/projects/:id" element={<ProjectDetail />} />

            {/* Legacy paths — keep old bookmarks/links working */}
            <Route path="/docs" element={<Navigate to="/sops" replace />} />
            <Route path="/documentation" element={<Navigate to="/sops" replace />} />
            <Route path="/documentation/:id" element={<LegacyIdRedirect to="/sops/:id" />} />
            <Route path="/flows" element={<Navigate to="/flow-manuals" replace />} />
            <Route path="/flows/view/:id" element={<LegacyIdRedirect to="/flow-manuals/view/:id" />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/forms" element={<Forms />} />
              <Route path="/files" element={<Files />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/facilities/:id" element={<FacilityDetail />} />
              <Route path="/project-links" element={<ProjectLinks />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminPanel />}>
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="platform-links" element={<PlatformLinks />} />
                <Route path="projects" element={<Projects />} />
              </Route>
              {/* Legacy paths — keep old bookmarks/links working */}
              <Route path="/users" element={<Navigate to="/admin/users" replace />} />
              <Route path="/settings/platform-links" element={<Navigate to="/admin/platform-links" replace />} />
              <Route path="/sops/add" element={<DocumentForm />} />
              <Route path="/sops/edit/:id" element={<DocumentForm />} />
              <Route path="/documentation/add" element={<Navigate to="/sops/add" replace />} />
              <Route path="/documentation/edit/:id" element={<LegacyIdRedirect to="/sops/edit/:id" />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin', 'HIS_TEAM']} />}>
              <Route path="/flow-manuals/add" element={<FlowBuilder />} />
              <Route path="/flow-manuals/edit/:id" element={<FlowBuilder />} />
              <Route path="/flows/add" element={<Navigate to="/flow-manuals/add" replace />} />
              <Route path="/flows/edit/:id" element={<LegacyIdRedirect to="/flow-manuals/edit/:id" />} />
              <Route path="/facilities/add" element={<FacilityForm />} />
              <Route path="/facilities/edit/:id" element={<FacilityForm />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
