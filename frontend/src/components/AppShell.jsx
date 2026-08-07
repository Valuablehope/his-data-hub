import React from 'react';
import { Outlet } from 'react-router-dom';
import FloatingNav from './FloatingNav';

const AppShell = () => {
  return (
    <div className="app-container">
      <FloatingNav />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
