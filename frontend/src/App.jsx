import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Facilities from './pages/Facilities';
import FacilityDetail from './pages/FacilityDetail';
import FacilityForm from './pages/FacilityForm';
import AdminPanel from './pages/AdminPanel';
import UserManagement from './pages/UserManagement';
import PlatformLinks from './pages/PlatformLinks';
import ProjectLinks from './pages/ProjectLinks';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/docs" element={<Navigate to="/documentation" replace />} />
              <Route path="/documentation/:id" element={<DocumentViewer />} />
              <Route path="/flows" element={<Flows />} />
              <Route path="/flows/view/:id" element={<FlowViewer />} />
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
              </Route>
              {/* Legacy paths — keep old bookmarks/links working */}
              <Route path="/users" element={<Navigate to="/admin/users" replace />} />
              <Route path="/settings/platform-links" element={<Navigate to="/admin/platform-links" replace />} />
              <Route path="/documentation/add" element={<DocumentForm />} />
              <Route path="/documentation/edit/:id" element={<DocumentForm />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin', 'HIS_TEAM']} />}>
              <Route path="/flows/add" element={<FlowBuilder />} />
              <Route path="/flows/edit/:id" element={<FlowBuilder />} />
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
