import React, { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FloatingNav from './FloatingNav';
import { AuthContext } from '../context/AuthContext';

// SOPs and Flows are public, shareable pages — for an anonymous visitor
// (someone opening a shared link) they render as standalone pages with no
// persistent nav bar, since the internal nav (Dashboard, Files, Facilities...)
// is chrome for the logged-in app, not for a document a stranger might land
// on. A logged-in HIS Team member gets the normal nav here like everywhere
// else in the app — they're still "in the app", just viewing public content.
// Only the *viewing* routes are ever standalone — /sops/add and
// /sops/edit/:id (and the flow-manuals equivalents) are logged-in-only
// management screens and always keep the normal nav.
function isStandalonePage(pathname) {
  if (pathname === '/sops' || pathname === '/flow-manuals') return true;
  if (pathname.startsWith('/flow-manuals/view/')) return true;
  if (pathname.startsWith('/projects/')) return true;
  const sopIdMatch = pathname.match(/^\/sops\/([^/]+)$/);
  if (sopIdMatch && sopIdMatch[1] !== 'add') return true;
  return false;
}

const AppShell = () => {
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);
  const hideNav = location.pathname === '/login' || (!isAuthenticated && isStandalonePage(location.pathname));

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
