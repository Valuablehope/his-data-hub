import { Activity, FileText, Network, ClipboardCheck, FolderOpen, Building2, BookMarked, UserCircle, Image } from 'lucide-react';

// Single source of truth for internal app destinations, consumed by both
// FloatingNav (persistent app nav) and AppsGrid (landing page launcher).
export const NAV_ITEMS = [
  { to: '/dashboard', icon: Activity, label: 'Dashboard', title: 'Mission Dashboard', color: '#E3000F', description: 'Live snapshot of mission status and data infrastructure.' },
  { to: '/documentation', icon: FileText, label: 'SOPs', title: 'SOPs', color: '#6366f1', description: 'Standard operating procedures and policy documentation.' },
  { to: '/flows', icon: Network, label: 'Flows', title: 'Flow Manuals', color: '#14b8a6', description: 'Step-by-step data flow documentation across systems.' },
  { to: '/forms', icon: ClipboardCheck, label: 'Forms', title: 'Forms', color: '#B45309', description: 'Activity and reporting forms.', soon: true },
  { to: '/files', icon: FolderOpen, label: 'Files', title: 'Files', color: '#f59e0b', description: 'Shared documents and uploaded reference material.' },
  { to: '/facilities', icon: Building2, label: 'Facilities', title: 'Facilities', color: '#3b82f6', description: 'Directory of tracked health facilities and their status.' },
  { to: '/project-links', icon: BookMarked, label: 'Project Links', title: 'Project Links', color: '#64748b', description: 'Reporting and budget tools used across mission projects.' },
  { to: '/users', icon: UserCircle, label: 'Users', title: 'User Management', color: '#64748b', description: 'Manage portal access and roles.', adminOnly: true },
  { to: '/settings/platform-links', icon: Image, label: 'Platform Links', title: 'Platform Links', color: '#64748b', description: 'Manage the platform logos shown in the site footer.', adminOnly: true },
];
