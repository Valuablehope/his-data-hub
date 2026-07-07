import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import FloatingNav from './components/FloatingNav';
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
import UserManagement from './pages/UserManagement';
import ProjectLinks from './pages/ProjectLinks';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <FloatingNav />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/flows" element={<Flows />} />
              <Route path="/flows/view/:id" element={<FlowViewer />} />
              <Route path="/flows/add" element={<FlowBuilder />} />
              <Route path="/flows/edit/:id" element={<FlowBuilder />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/documentation/add" element={<DocumentForm />} />
              <Route path="/documentation/edit/:id" element={<DocumentForm />} />
              <Route path="/documentation/:id" element={<DocumentViewer />} />
              <Route path="/forms" element={<Forms />} />
              <Route path="/files" element={<Files />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/facilities/add" element={<FacilityForm />} />
              <Route path="/facilities/edit/:id" element={<FacilityForm />} />
              <Route path="/facilities/:id" element={<FacilityDetail />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/project-links" element={<ProjectLinks />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
