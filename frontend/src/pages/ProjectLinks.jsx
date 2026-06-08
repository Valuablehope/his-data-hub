import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Link2, Plus, ExternalLink, FileSpreadsheet, TrendingUp, FolderOpen,
  Search, X, Edit2, Trash2, AlertCircle, Loader2, BookMarked
} from 'lucide-react';
import { API_BASE_URL, fetchApi } from '../config';
import { AuthContext } from '../context/AuthContext';

/* ─── tool type metadata ─────────────────────────────────────────────── */

const TOOL_TYPES = ['Reporting Tool', 'Budget Monitoring', 'Finance'];

const TOOL_META = {
  'Reporting Tool': {
    Icon: FileSpreadsheet,
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  'Budget Monitoring': {
    Icon: TrendingUp,
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  'Finance': {
    Icon: FolderOpen,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
};

const DEFAULT_META = { Icon: Link2, color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' };

function getLinkSource(url) {
  if (!url) return null;
  if (url.includes('docs.google.com')) return 'Google Sheets';
  if (url.includes('sharepoint.com')) return 'SharePoint';
  return null;
}

/* ─── Link chip ──────────────────────────────────────────────────────── */

function LinkChip({ link, onEdit, onDelete, isAdmin }) {
  const meta = TOOL_META[link.ToolType] || DEFAULT_META;
  const { Icon } = meta;
  const source = getLinkSource(link.LinkUrl);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.6rem 0.75rem',
      background: meta.bg,
      border: `1px solid ${meta.border}`,
      borderRadius: 'var(--radius-md)',
      marginBottom: '0.5rem',
    }}>
      <Icon size={15} style={{ color: meta.color, flexShrink: 0 }} />
      <a
        href={link.LinkUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flex: 1,
          fontSize: '0.8rem',
          fontWeight: 500,
          color: meta.color,
          textDecoration: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
        title={link.LinkLabel}
      >
        {link.LinkLabel}
      </a>
      {source && (
        <span style={{
          fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.02em',
          color: meta.color, opacity: 0.7,
          background: 'rgba(255,255,255,0.6)',
          padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)',
          flexShrink: 0,
        }}>
          {source === 'Google Sheets' ? 'Sheets' : 'SP'}
        </span>
      )}
      <a
        href={link.LinkUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: meta.color, opacity: 0.6, flexShrink: 0, display: 'flex' }}
        title="Open link"
      >
        <ExternalLink size={13} />
      </a>
      {isAdmin && (
        <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
          {confirmDelete ? (
            <>
              <button
                onClick={() => onDelete(link.Id)}
                style={{
                  fontSize: '0.65rem', fontWeight: 600,
                  color: '#fff', background: 'var(--red-500)',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  padding: '0.15rem 0.4rem', cursor: 'pointer',
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  fontSize: '0.65rem', color: 'var(--text-muted)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                }}
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(link)}
                className="icon-btn"
                style={{ width: '22px', height: '22px', color: 'var(--text-muted)' }}
                title="Edit"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="icon-btn"
                style={{ width: '22px', height: '22px', color: 'var(--text-muted)' }}
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Project card ───────────────────────────────────────────────────── */

function ProjectCard({ projectCode, projectName, links, onEdit, onDelete, isAdmin }) {
  const byType = TOOL_TYPES.reduce((acc, t) => {
    acc[t] = links.filter(l => l.ToolType === t);
    return acc;
  }, {});

  const otherLinks = links.filter(l => !TOOL_TYPES.includes(l.ToolType));

  return (
    <div className="bento-item" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'inline-block',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--primary-red)',
          background: 'var(--primary-red-glow)',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          marginBottom: '0.35rem',
          letterSpacing: '0.03em',
        }}>
          {projectCode}
        </div>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          {projectName}
        </h3>
      </div>

      <div style={{ flex: 1 }}>
        {TOOL_TYPES.map(type => {
          const typeLinks = byType[type];
          if (!typeLinks || typeLinks.length === 0) return null;
          const meta = TOOL_META[type] || DEFAULT_META;
          return (
            <div key={type} style={{ marginBottom: '0.75rem' }}>
              <div style={{
                fontSize: '0.7rem', fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '0.35rem',
              }}>
                {type}
              </div>
              {typeLinks.map(link => (
                <LinkChip
                  key={link.Id}
                  link={link}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          );
        })}
        {otherLinks.map(link => (
          <LinkChip key={link.Id} link={link} onEdit={onEdit} onDelete={onDelete} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}

/* ─── Modal ──────────────────────────────────────────────────────────── */

const EMPTY_FORM = { projectCode: '', projectName: '', toolType: 'Reporting Tool', linkLabel: '', linkUrl: '', sortOrder: 0 };

function LinkModal({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'projectCode' && !initial) {
      setForm(f => ({ ...f, projectCode: value, projectName: value.replace(/_/g, ' ') }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  const isEdit = !!initial?.Id;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '2rem',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {isEdit ? 'Edit Link' : 'Add New Link'}
          </h2>
          <button onClick={onClose} className="icon-btn"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project Code</span>
              <input
                className="fac-search-input"
                value={form.projectCode}
                onChange={e => set('projectCode', e.target.value)}
                placeholder="e.g. LHF_25078"
                required
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project Name</span>
              <input
                className="fac-search-input"
                value={form.projectName}
                onChange={e => set('projectName', e.target.value)}
                placeholder="e.g. LHF 25078"
                required
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tool Type</span>
            <select
              className="fac-search-input"
              value={form.toolType}
              onChange={e => set('toolType', e.target.value)}
              required
            >
              {TOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="Other">Other</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Link Label</span>
            <input
              className="fac-search-input"
              value={form.linkLabel}
              onChange={e => set('linkLabel', e.target.value)}
              placeholder="Display name for the link"
              required
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>URL</span>
            <input
              className="fac-search-input"
              type="url"
              value={form.linkUrl}
              onChange={e => set('linkUrl', e.target.value)}
              placeholder="https://..."
              required
            />
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────── */

export default function ProjectLinks() {
  const { user } = useContext(AuthContext);
  const isAdmin = !!user;

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | {link object}
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApi(`${API_BASE_URL}/project-links`)
      .then(r => r.json())
      .then(data => { setLinks(data); setLoading(false); })
      .catch(() => { setError('Failed to load project links.'); setLoading(false); });
  }, []);

  const projects = useMemo(() => {
    const filtered = links.filter(l => {
      const matchSearch = !search ||
        l.ProjectName.toLowerCase().includes(search.toLowerCase()) ||
        l.ProjectCode.toLowerCase().includes(search.toLowerCase()) ||
        l.LinkLabel.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || l.ToolType === typeFilter;
      return matchSearch && matchType;
    });

    const map = {};
    filtered.forEach(link => {
      if (!map[link.ProjectCode]) {
        map[link.ProjectCode] = { code: link.ProjectCode, name: link.ProjectName, links: [] };
      }
      map[link.ProjectCode].links.push(link);
    });
    return Object.values(map).sort((a, b) => a.code.localeCompare(b.code));
  }, [links, search, typeFilter]);

  async function handleSave(form) {
    setSaving(true);
    try {
      const isEdit = !!modal?.Id;
      const url = isEdit
        ? `${API_BASE_URL}/project-links/${modal.Id}`
        : `${API_BASE_URL}/project-links`;
      const res = await fetchApi(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      if (isEdit) {
        setLinks(prev => prev.map(l => l.Id === saved.Id ? saved : l));
      } else {
        setLinks(prev => [...prev, saved]);
      }
      setModal(null);
    } catch {
      alert('Failed to save link. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await fetchApi(`${API_BASE_URL}/project-links/${id}`, { method: 'DELETE' });
      setLinks(prev => prev.filter(l => l.Id !== id));
    } catch {
      alert('Failed to delete link.');
    }
  }

  const totalLinks = links.length;
  const projectCount = useMemo(() => new Set(links.map(l => l.ProjectCode)).size, [links]);

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">
            <BookMarked size={28} />
            Project Tools &amp; Links
          </h1>
          <p className="page-subtitle">
            Quick access to reporting tools, budget monitors, and finance resources
            {!loading && (
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                — {projectCount} project{projectCount !== 1 ? 's' : ''}, {totalLinks} link{totalLinks !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setModal('add')}>
            <Plus size={18} />
            Add Link
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            className="fac-search-input"
            style={{ paddingLeft: '2.25rem', width: '100%' }}
            placeholder="Search projects or links…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['All', ...TOOL_TYPES].map(t => {
            const active = typeFilter === t;
            const meta = TOOL_META[t];
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  border: active
                    ? `1px solid ${meta ? meta.color : 'var(--primary-red)'}`
                    : '1px solid var(--border-color)',
                  background: active
                    ? (meta ? meta.bg : 'var(--primary-red-glow)')
                    : 'var(--surface-color)',
                  color: active
                    ? (meta ? meta.color : 'var(--primary-red)')
                    : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bento-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bento-item" style={{ minHeight: '200px' }}>
              <div style={{ height: '20px', width: '80px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ height: '16px', width: '120px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }} />
              {[1, 2, 3].map(j => (
                <div key={j} style={{ height: '36px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
              ))}
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <AlertCircle size={40} style={{ color: 'var(--red-500)', marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600 }}>{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <BookMarked size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
            {search || typeFilter !== 'All' ? 'No results found' : 'No links yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {search || typeFilter !== 'All'
              ? 'Try adjusting your search or filter.'
              : 'Add your first project link to get started.'}
          </p>
          {isAdmin && (typeFilter === 'All' && !search) && (
            <button className="btn btn-primary" onClick={() => setModal('add')}>
              <Plus size={18} /> Add First Link
            </button>
          )}
        </div>
      ) : (
        <div className="bento-grid">
          {projects.map(p => (
            <ProjectCard
              key={p.code}
              projectCode={p.code}
              projectName={p.name}
              links={p.links}
              onEdit={link => setModal(link)}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <LinkModal
          initial={modal === 'add' ? null : {
            Id: modal.Id,
            projectCode: modal.ProjectCode,
            projectName: modal.ProjectName,
            toolType: modal.ToolType,
            linkLabel: modal.LinkLabel,
            linkUrl: modal.LinkUrl,
            sortOrder: modal.SortOrder,
          }}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
