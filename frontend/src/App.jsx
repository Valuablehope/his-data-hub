import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import FloatingNav from './components/FloatingNav';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Flows from './pages/Flows';
import Forms from './pages/Forms';
import Files from './pages/Files';
import Login from './pages/Login';
import FlowViewer from './pages/FlowViewer';
import FlowBuilder from './pages/FlowBuilder';

const AuthenticatedApp = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div className="app-container">
        <FloatingNav />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/flows" element={<Flows />} />
            <Route path="/flows/view/:id" element={<FlowViewer />} />
            <Route path="/flows/add" element={<FlowBuilder />} />
            <Route path="/flows/edit/:id" element={<FlowBuilder />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/forms" element={<Forms />} />
            <Route path="/files" element={<Files />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
