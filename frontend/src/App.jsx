import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import FloatingNav from './components/FloatingNav';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Flows from './pages/Flows';
import Forms from './pages/Forms';
import Login from './pages/Login';

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
            <Route path="/forms" element={<Forms />} />
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
