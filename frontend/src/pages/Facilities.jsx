import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, ChevronUp, ChevronDown, Download, Eye, Edit2, Trash2,
  X, SlidersHorizontal, ChevronLeft, ChevronRight,
  AlertCircle, Building,
} from 'lucide-react';
import { API_BASE_URL, fetchApi } from '../config';
import { AuthContext } from '../context/AuthContext';
import '../facilities.css';

/* ─── Helpers ───────────────────────────────────────────── */
function statusClass(s) {
  return s === 'Active' ? 'active' : s === 'Suspended' ? 'suspended' : 'inactive';
}
function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
const PAGE_SIZE = 15;

function SortIcon({ col, sort }) {
  if (sort.key !== col) return <ChevronUp size={11} style={{ opacity: 0.25 }} />;
  return sort.dir === 'asc'
    ? <ChevronUp size={11} style={{ color: 'var(--text-primary)' }} />
    : <ChevronDown size={11} style={{ color: 'var(--text-primary)' }} />;
}

function SkeletonRow() {
  return (
    <tr className="fac-skeleton-row">
      {[200, 60, 90, 90, 90, 65, 75, 50].map((w, i) => (
        <td key={i}><div className="fac-skeleton" style={{ width: w, height: 13 }} /></td>
      ))}
    </tr>
  );
}

function GrantBadge({ grant }) {
  if (!grant) return null;
  return (
    <span className={`grant-badge ${grant.color || 'secondary'}`} title={`${grant.name} · ${grant.donor}`}>
      {grant.code}
    </span>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Facilities() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [facilities, setFacilities] = useState([]);
  const [grants,     setGrants]     = useState([]);
  const [options,    setOptions]    = useState({ types: [], areas: [], bases: [], statuses: [] });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [search, setSearch]           = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]         = useState({ type: '', area: '', base: '', mainGrant: '', status: '' });
  const [sort, setSort]               = useState({ key: 'name', dir: 'asc' });
  const [page, setPage]               = useState(1);

  // Fetch all data on mount
  useEffect(() => {
    setLoading(true);
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };
    Promise.all([
      fetchApi(`${API_BASE_URL}/facilities`, authHeaders).then(r => r.json()),
      fetchApi(`${API_BASE_URL}/facilities/meta/grants`, authHeaders).then(r => r.json()),
      fetchApi(`${API_BASE_URL}/facilities/meta/options`, authHeaders).then(r => r.json()),
    ])
    .then(([facs, grnts, opts]) => {
      setFacilities(facs);
      setGrants(grnts);
      setOptions(opts);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message || 'Failed to load facilities');
      setLoading(false);
    });
  }, [token]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filtered = useMemo(() => {
    let list = facilities;
    const q = search.toLowerCase().trim();
    if (q) list = list.filter(f =>
      (f.name              || '').toLowerCase().includes(q) ||
      (f.area              || '').toLowerCase().includes(q) ||
      (f.base              || '').toLowerCase().includes(q) ||
      (f.type              || '').toLowerCase().includes(q) ||
      (f.mainGrant?.code   || '').toLowerCase().includes(q) ||
      (f.mainGrant?.name   || '').toLowerCase().includes(q)
    );
    if (filters.type)      list = list.filter(f => f.type  === filters.type);
    if (filters.area)      list = list.filter(f => f.area  === filters.area);
    if (filters.base)      list = list.filter(f => f.base  === filters.base);
    if (filters.status)    list = list.filter(f => f.status === filters.status);
    if (filters.mainGrant) list = list.filter(f => f.mainGrant?.code === filters.mainGrant);
    return [...list].sort((a, b) => {
      let av = a[sort.key] ?? '';
      let bv = b[sort.key] ?? '';
      if (sort.key === 'mainGrant') { av = a.mainGrant?.code ?? ''; bv = b.mainGrant?.code ?? ''; }
      return sort.dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [facilities, search, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);


  const handleSort = useCallback((key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  }, []);

  const setFilter = useCallback((key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  }, []);

  const clearAll = useCallback(() => {
    setFilters({ type: '', area: '', base: '', mainGrant: '', status: '' });
    setSearch('');
    setPage(1);
  }, []);

  const handleDelete = useCallback(async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    try {
      await fetchApi(`${API_BASE_URL}/facilities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setFacilities(prev => prev.filter(f => f.id !== id));
    } catch {
      alert('Failed to delete facility.');
    }
  }, [token]);

  const handleExport = useCallback(() => {
    const headers = ['#', 'PHCC Name', 'Type', 'District', 'Base', 'Main Grant', 'Coverage Month', 'Status', 'Last Updated'];
    const rows = filtered.map(f => [
      f.id, f.name, f.type, f.area, f.base,
      f.mainGrant?.code ?? '',
      f.coverageMonth && f.coverageYear ? `${f.coverageMonth}/${f.coverageYear}` : '',
      f.status, formatDate(f.lastUpdated),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'facilities.csv',
    });
    a.click();
  }, [filtered]);

  const LABEL = { type: 'Type', area: 'District', base: 'Base', status: 'Status', mainGrant: 'Grant' };

  if (error) {
    return (
      <div className="fac-page">
        <div className="fac-empty" style={{ paddingTop: '4rem' }}>
          <div className="fac-empty-icon"><AlertCircle size={22} /></div>
          <div className="fac-empty-title">Could not load facilities</div>
          <div className="fac-empty-desc">{error}</div>
          <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fac-page">

      {/* ── Unified Page Header ─────────────────────────── */}
      <div className="fac-page-hd">
        {/* Left — title + live count */}
        <div className="fac-hd-left">
          <h1 className="fac-hd-title">Facilities</h1>
          {!loading && (
            <span className="fac-hd-count">{filtered.length}</span>
          )}
        </div>

        {/* Right — search + controls */}
        <div className="fac-hd-right">
          <div className="fac-search-wrap" style={{ maxWidth: 300 }}>
            <Search size={13} className="fac-search-icon" />
            <input
              className="fac-search-input"
              placeholder="Search PHCCs, grants, districts…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              disabled={loading}
            />
          </div>

          <button
            className={`fac-hd-btn${showFilters ? ' fac-hd-btn--active' : ''}`}
            onClick={() => setShowFilters(v => !v)}
            disabled={loading}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span className="fac-hd-badge">{activeFilterCount}</span>
            )}
          </button>

          <div className="fac-hd-sep" />

          <button className="fac-hd-btn" onClick={handleExport} disabled={loading}>
            <Download size={13} />
            Export
          </button>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/facilities/add')}
            style={{ height: 34, fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
          >
            <Plus size={13} /> Add Facility
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="fac-active-filters" style={{ marginBottom: '0.875rem' }}>
          {Object.entries(filters).map(([key, val]) => val ? (
            <button key={key} className="fac-filter-chip" onClick={() => setFilter(key, '')}>
              <span>{LABEL[key]}: {val}</span>
              <span className="fac-filter-chip-x"><X size={10} /></span>
            </button>
          ) : null)}
          <button onClick={clearAll} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.25rem' }}>
            Clear all
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="fac-filter-panel">
          {[
            { key: 'type',   label: 'Facility Type', opts: options.types    },
            { key: 'area',   label: 'District',       opts: options.areas    },
            { key: 'base',   label: 'Base',           opts: options.bases    },
            { key: 'status', label: 'Status',         opts: options.statuses },
          ].map(({ key, label, opts }) => (
            <div key={key} className="fac-filter-group">
              <label>{label}</label>
              <select className="fac-filter-select" value={filters[key]} onChange={e => setFilter(key, e.target.value)}>
                <option value="">All</option>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div className="fac-filter-group">
            <label>Main Grant</label>
            <select className="fac-filter-select" value={filters.mainGrant} onChange={e => setFilter('mainGrant', e.target.value)}>
              <option value="">All grants</option>
              {grants.map(g => <option key={g.id} value={g.code}>{g.code}</option>)}
            </select>
          </div>
          <div className="fac-filter-panel-footer">
            <button className="btn btn-ghost" style={{ height: 30, fontSize: '0.78rem' }} onClick={clearAll}>Reset</button>
            <button className="btn btn-primary" style={{ height: 30, fontSize: '0.78rem' }} onClick={() => setShowFilters(false)}>Apply</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="fac-table-wrap">

        <div className="fac-table-scroll">
          <table className="fac-table">
            <thead>
              <tr>
                {[
                  { key: 'name',        label: 'PHCC Name',  width: '26%'  },
                  { key: 'type',        label: 'Type',       width: '10%'  },
                  { key: 'area',        label: 'District',   width: '12%'  },
                  { key: 'base',        label: 'Base',       width: '10%'  },
                  { key: 'mainGrant',   label: 'Main Grant', width: '12%'  },
                  { key: 'status',      label: 'Status',     width: '10%'  },
                  { key: 'lastUpdated', label: 'Updated',    width: '10%'  },
                  { key: '_actions',    label: '',           width: '110px', noSort: true },
                ].map(col => (
                  <th
                    key={col.key}
                    className={sort.key === col.key ? 'fac-th-sorted' : ''}
                    onClick={() => !col.noSort && handleSort(col.key)}
                    style={{ width: col.width, ...(col.noSort ? { cursor: 'default' } : {}) }}
                  >
                    <span className="fac-th-inner">
                      {col.label}
                      {!col.noSort && <SortIcon col={col.key} sort={sort} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} />)
                : paginated.length === 0
                ? (
                  <tr><td colSpan={8}>
                    <div className="fac-empty">
                      <div className="fac-empty-icon"><AlertCircle size={22} /></div>
                      <div className="fac-empty-title">No facilities found</div>
                      <div className="fac-empty-desc">
                        {search || activeFilterCount > 0
                          ? 'Try adjusting your search or filters.'
                          : 'No facilities in the database yet. Run the seed script to import data.'}
                      </div>
                    </div>
                  </td></tr>
                )
                : paginated.map(f => (
                  <tr key={f.id} onClick={() => navigate(`/facilities/${f.id}`)}>
                    <td>
                      <div className="fac-name-cell">
                        <div className="fac-name-avatar"><Building size={13} /></div>
                        <div className="fac-name-info">
                          <span className="fac-name-primary" title={f.name}>{f.name}</span>
                          <span className="fac-name-id">FAC-{String(f.id).padStart(4, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="fac-type-pill">{f.type}</span></td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{f.area}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{f.base}</td>
                    <td>
                      {f.mainGrant
                        ? <GrantBadge grant={f.mainGrant} />
                        : <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <span className={`fac-status ${statusClass(f.status)}`}>
                        <span className="fac-status-dot" />{f.status}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {formatDate(f.lastUpdated)}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="fac-row-actions">
                        <button className="fac-row-btn" title="View" onClick={() => navigate(`/facilities/${f.id}`)}><Eye size={13} /></button>
                        <button className="fac-row-btn" title="Edit" onClick={() => navigate(`/facilities/edit/${f.id}`)}><Edit2 size={13} /></button>
                        <button className="fac-row-btn danger" title="Delete" onClick={e => handleDelete(f.id, e)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > PAGE_SIZE && (
          <div className="fac-pagination">
            <span className="fac-pagination-info">
              {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="fac-pagination-controls">
              <button className="fac-page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}><ChevronLeft size={13} /></button>
              {Array.from({ length: totalPages }, (_, i) => i+1)
                .filter(p => p===1 || p===totalPages || Math.abs(p-page)<=1)
                .reduce((acc, p, i, arr) => { if (i>0 && arr[i-1]!==p-1) acc.push('…'); acc.push(p); return acc; }, [])
                .map((p, i) =>
                  p === '…'
                    ? <span key={`e${i}`} style={{ padding:'0 0.25rem', fontSize:'0.75rem', color:'var(--text-muted)' }}>…</span>
                    : <button key={p} className={`fac-page-btn ${p===page?'active':''}`} onClick={() => setPage(p)}>{p}</button>
                )}
              <button className="fac-page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}><ChevronRight size={13} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
