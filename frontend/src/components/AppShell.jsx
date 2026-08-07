import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FloatingNav from './FloatingNav';

const AppShell = () => {
  const location = useLocation();
  const hideNav = location.pathname === '/login';

  return (
    <div className="app-container">
      {!hideNav && <FloatingNav />}
      <main className={`main-content${hideNav ? ' main-content--no-nav' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
