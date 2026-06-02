import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import FloatingNav from './components/FloatingNav';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Flows from './pages/Flows';
import Forms from './pages/Forms';
import Files from './pages/Files';
import FlowViewer from './pages/FlowViewer';
import FlowBuilder from './pages/FlowBuilder';
import Facilities from './pages/Facilities';
import FacilityDetail from './pages/FacilityDetail';
import FacilityForm from './pages/FacilityForm';

function App() {
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
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/facilities/add" element={<FacilityForm />} />
            <Route path="/facilities/edit/:id" element={<FacilityForm />} />
            <Route path="/facilities/:id" element={<FacilityDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
