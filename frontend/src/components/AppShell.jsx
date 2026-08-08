import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FloatingNav from './FloatingNav';

// SOPs and Flows are public, shareable pages — they render as standalone
// pages with no persistent nav bar, since the internal nav (Dashboard, Files,
// Facilities...) is chrome for the logged-in app, not for a document someone
// might open from an outside link. Only the public *viewing* routes qualify —
// /sops/add and /sops/edit/:id (and the flow-manuals equivalents) are
// logged-in-only management screens and keep the normal nav.
function isStandalonePage(pathname) {
  if (pathname === '/sops' || pathname === '/flow-manuals') return true;
  if (pathname.startsWith('/flow-manuals/view/')) return true;
  const sopIdMatch = pathname.match(/^\/sops\/([^/]+)$/);
  if (sopIdMatch && sopIdMatch[1] !== 'add') return true;
  return false;
}

const AppShell = () => {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || isStandalonePage(location.pathname);

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
