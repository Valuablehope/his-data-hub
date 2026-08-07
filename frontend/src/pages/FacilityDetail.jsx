import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building, Shield, Edit2, Trash2,
  ChevronLeft, ChevronRight, History, Info, AlertCircle,
  Globe, Layers, MapPin, Plus, X, Save, Check,
} from 'lucide-react';
import { API_BASE_URL, fetchApi } from '../config';
import { AuthContext } from '../context/AuthContext';
import '../facilities.css';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const COV_STATUSES = ['Active', 'Ended', 'Replaced'];

/* ─── Helpers ───────────────────────────────────────────── */
function statusClass(s) {
  return s === 'Active' ? 'active' : s === 'Suspended' ? 'suspended' : 'inactive';
}
function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function isoDate(str) {
  if (!str) return '';
  return new Date(str).toISOString().slice(0, 10);
}

function GrantBadge({ grant, variant }) {
  if (!grant) return null;
  const cls = variant === 'main' ? 'main' : (grant.color || 'secondary');
  return (
    <span className={`grant-badge ${cls}`} title={`${grant.name} · ${grant.donor}`}>
      {grant.code}
    </span>
  );
}
function CovStatusBadge({ status }) {
  const cls = status === 'Active' ? 'active' : status === 'Ended' ? 'ended' : 'replaced';
  return <span className={`fac-cov-status ${cls}`}>{status}</span>;
}
function DetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="fac-skeleton" style={{ height: 32, width: 300, borderRadius: 6 }} />
      <div className="fac-skeleton" style={{ height: 20, width: 200, borderRadius: 4 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.25rem', marginTop: '1rem' }}>
        <div className="fac-skeleton" style={{ height: 400, borderRadius: 12 }} />
        <div className="fac-skeleton" style={{ height: 400, borderRadius: 12 }} />
      </div>
    </div>
  );
}

/* ─── Coverage Edit Slide-Over ───────────────────────────── */
function CoverageSlideOver({ record, facilityId, grants, onSave, onClose }) {
  const { token } = useContext(AuthContext);
  const isNew = record === 'new';

  const [form, setForm] = useState({
    month:       isNew ? '' : record.month,
    year:        isNew ? new Date().getFullYear() : record.year,
    mainGrantId: isNew ? '' : (record.mainGrant?.id ?? ''),
    status:      isNew ? 'Active' : (record.status ?? 'Active'),
    periodStart: isNew ? '' : isoDate(record.periodStart),
    periodEnd:   isNew ? '' : isoDate(record.periodEnd),
    activities:  isNew ? '' : (record.activities ?? ''),
    notes:       isNew ? '' : (record.notes ?? ''),
    updatedBy:   isNew ? '' : (record.updatedBy ?? ''),
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.mainGrantId) { setError('Main grant is required.'); return; }
    if (!form.month)       { setError('Month is required.'); return; }
    setError(null);
    setSaving(true);
    try {
      const res = await fetchApi(`${API_BASE_URL}/facilities/${facilityId}/coverage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          mainGrantId:  Number(form.mainGrantId),
          month:        Number(form.month),
          year:         Number(form.year),
          status:       form.status,
          periodStart:  form.periodStart || null,
          periodEnd:    form.periodEnd   || null,
          activities:   form.activities  || null,
          notes:        form.notes       || null,
          updatedBy:    form.updatedBy   || 'admin',
          secondaryGrantIds: [],
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Save failed');
      }
      await onSave();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const title = isNew
    ? 'Add Coverage Record'
    : `${MONTHS_FULL[form.month - 1]} ${form.year}`;

  return (
    <>
      <div className="fac-slideover-backdrop" onClick={onClose} />
      <div className="fac-slideover">
        {/* Header */}
        <div className="fac-slideover-hd">
          <div>
            <div className="fac-slideover-eyebrow">Coverage History</div>
            <div className="fac-slideover-title">{title}</div>
          </div>
          <button className="fac-slideover-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="fac-slideover-body">
          {error && (
            <div className="fac-slideover-error">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          {/* Month / Year — only editable when adding */}
          <div className="fac-slideover-grid2">
            <div className="fac-slideover-field">
              <label>Month</label>
              {isNew ? (
                <select className="fac-form-select" value={form.month} onChange={e => set('month', e.target.value)}>
                  <option value="">Select…</option>
                  {MONTHS_FULL.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              ) : (
                <div className="fac-slideover-readonly">{MONTHS_FULL[form.month - 1]}</div>
              )}
            </div>
            <div className="fac-slideover-field">
              <label>Year</label>
              {isNew ? (
                <input className="fac-form-input" type="number" min="2020" max="2035"
                  value={form.year} onChange={e => set('year', e.target.value)} />
              ) : (
                <div className="fac-slideover-readonly">{form.year}</div>
              )}
            </div>
          </div>

          {/* Main Grant */}
          <div className="fac-slideover-field">
            <label>Main Grant <span style={{ color: 'var(--primary-red)' }}>*</span></label>
            <select className="fac-form-select" value={form.mainGrantId}
              onChange={e => set('mainGrantId', e.target.value)}>
              <option value="">Select grant…</option>
              {grants.map(g => (
                <option key={g.id} value={g.id}>{g.code} — {g.name}</option>
              ))}
            </select>
          </div>

          {/* Coverage Status */}
          <div className="fac-slideover-field">
            <label>Coverage Status</label>
            <div className="fac-slideover-radio">
              {COV_STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  className={`fac-radio-btn${form.status === s ? ' active' : ''}`}
                  onClick={() => set('status', s)}
                >
                  {form.status === s && <Check size={11} />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div className="fac-slideover-grid2">
            <div className="fac-slideover-field">
              <label>Period Start</label>
              <input className="fac-form-input" type="date" value={form.periodStart}
                onChange={e => set('periodStart', e.target.value)} />
            </div>
            <div className="fac-slideover-field">
              <label>Period End</label>
              <input className="fac-form-input" type="date" value={form.periodEnd}
                onChange={e => set('periodEnd', e.target.value)} />
            </div>
          </div>

          {/* Activities */}
          <div className="fac-slideover-field">
            <label>Activities Covered</label>
            <textarea className="fac-form-textarea" rows={3}
              placeholder="Primary healthcare, Vaccination, Emergency referrals…"
              value={form.activities} onChange={e => set('activities', e.target.value)} />
          </div>

          {/* Notes */}
          <div className="fac-slideover-field">
            <label>Coverage Notes</label>
            <textarea className="fac-form-textarea" rows={3}
              placeholder="Any relevant context for this coverage period…"
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {/* Updated By */}
          <div className="fac-slideover-field">
            <label>Updated By</label>
            <input className="fac-form-input" placeholder="Name or team"
              value={form.updatedBy} onChange={e => set('updatedBy', e.target.value)} />
          </div>
        </div>

        {/* Footer */}
        <div className="fac-slideover-ft">
          <button className="btn btn-ghost" style={{ height: 36, fontSize: '0.8rem' }} onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" style={{ height: 36, fontSize: '0.8rem', minWidth: 110 }}
            onClick={handleSave} disabled={saving}>
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="fac-spin" /> Saving…
              </span>
            ) : (
              <><Save size={13} /> {isNew ? 'Add Record' : 'Save Changes'}</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function FacilityDetail() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const { token } = useContext(AuthContext);

  const [facility,  setFacility]  = useState(null);
  const [coverage,  setCoverage]  = useState([]);
  const [grants,    setGrants]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [historyYear, setHistoryYear] = useState(null);

  // Edit slide-over
  const [editRecord, setEditRecord] = useState(null); // null | record | 'new'

  const loadData = () => {
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };
    return Promise.all([
      fetchApi(`${API_BASE_URL}/facilities/${id}`, authHeaders).then(r => {
        if (!r.ok) throw new Error('Facility not found');
        return r.json();
      }),
      fetchApi(`${API_BASE_URL}/facilities/${id}/coverage`, authHeaders).then(r => r.json()),
      fetchApi(`${API_BASE_URL}/facilities/meta/grants`, authHeaders).then(r => r.json()),
    ]).then(([fac, cov, grnts]) => {
      setFacility(fac);
      setCoverage(cov);
      setGrants(grnts);
      const years = [...new Set(cov.map(c => c.year))].sort((a, b) => b - a);
      if (!historyYear) setHistoryYear(years[0] || new Date().getFullYear());
    });
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadData()
      .catch(err => setError(err.message || 'Failed to load facility'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const availableYears = useMemo(
    () => [...new Set(coverage.map(c => c.year))].sort((a, b) => b - a),
    [coverage]
  );
  const yearHistory = useMemo(
    () => coverage.filter(c => c.year === historyYear).sort((a, b) => b.month - a.month),
    [coverage, historyYear]
  );
  const timelineData = useMemo(
    () => MONTHS_SHORT.map((label, i) => {
      const month  = i + 1;
      const record = coverage.find(c => c.year === historyYear && c.month === month);
      return { label, month, record };
    }),
    [coverage, historyYear]
  );

  const currentMonth = new Date().getMonth() + 1;
  const currentYear  = new Date().getFullYear();

  if (error) {
    return (
      <div className="fac-detail-page">
        <button className="fac-back" onClick={() => navigate('/facilities')}>
          <ArrowLeft size={13} /> Back to Facilities
        </button>
        <div className="fac-empty" style={{ marginTop: '2rem' }}>
          <div className="fac-empty-icon"><AlertCircle size={22} /></div>
          <div className="fac-empty-title">Facility not found</div>
          <div className="fac-empty-desc">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fac-detail-page">
      {/* Slide-over panel */}
      {editRecord && (
        <CoverageSlideOver
          record={editRecord}
          facilityId={id}
          grants={grants}
          onSave={loadData}
          onClose={() => setEditRecord(null)}
        />
      )}

      {/* Back */}
      <button className="fac-back" onClick={() => navigate('/facilities')}>
        <ArrowLeft size={13} />
        <span>Facilities</span>
        <span style={{ color: 'var(--border-color)', margin: '0 0.1rem' }}>/</span>
        <span style={{ color: 'var(--text-secondary)' }}>{facility?.name ?? `FAC-${String(id).padStart(4,'0')}`}</span>
      </button>

      {loading ? <DetailSkeleton /> : (
        <>
          {/* Hero — compact */}
          <div className="fac-detail-hero">
            {/* Row 1: name + actions */}
            <div className="fac-hero-row1">
              <h1 className="fac-hero-name">{facility.name}</h1>
              <div className="fac-hero-actions">
                <button className="fac-hd-btn" style={{ height:32 }}
                  onClick={() => navigate(`/facilities/edit/${facility.id}`)}>
                  <Edit2 size={13} /> Edit
                </button>
                <button className="fac-hd-btn" style={{ height:32, color:'var(--primary-red)', borderColor:'rgba(227,0,15,0.2)' }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>

            {/* Row 2: compact meta strip */}
            <div className="fac-hero-strip">
              <span className="fac-strip-pill">
                <Building size={11} /> {facility.type}
              </span>
              <span className="fac-strip-sep" />
              <span className={`fac-status ${statusClass(facility.status)}`} style={{ fontSize:'0.65rem', padding:'0.15rem 0.5rem' }}>
                <span className="fac-status-dot" />{facility.status}
              </span>
              <span className="fac-strip-sep" />
              <span className="fac-strip-item"><Globe size={11} />{facility.area}</span>
              <span className="fac-strip-dot">·</span>
              <span className="fac-strip-item"><Layers size={11} />{facility.base}</span>
              {facility.address && (
                <><span className="fac-strip-dot">·</span>
                <span className="fac-strip-item"><MapPin size={11} />{facility.address}</span></>
              )}
              <span className="fac-strip-sep" />
              <span className="fac-strip-id">FAC-{String(facility.id).padStart(4,'0')}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="fac-tabs">
            {[
              { id: 'overview', label: 'Overview',         icon: <Info size={13} /> },
              { id: 'coverage', label: 'Grant Coverage',   icon: <Shield size={13} /> },
              { id: 'history',  label: 'Coverage History', icon: <History size={13} />, count: coverage.length },
            ].map(tab => (
              <button key={tab.id} className={`fac-tab ${activeTab===tab.id?'active':''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.icon} {tab.label}
                {tab.count != null && <span className="fac-tab-badge">{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* ── Overview ─────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="fac-detail-grid">
              <div className="fac-detail-card">
                <div className="fac-detail-card-hd">
                  <span className="fac-detail-card-title">Facility Information</span>
                </div>
                <div className="fac-detail-card-body">
                  {[
                    { label: 'PHCC Name',    value: facility.name },
                    { label: 'Type',         value: <span className="fac-type-pill" style={{ fontSize:'0.75rem' }}>{facility.type}</span> },
                    { label: 'District',     value: facility.area },
                    { label: 'Base',         value: facility.base },
                    { label: 'Address',      value: facility.address },
                    { label: 'Coordinates',  value: facility.coordinates, mono: true },
                    { label: 'Status',       value: <span className={`fac-status ${statusClass(facility.status)}`} style={{ fontSize:'0.68rem' }}><span className="fac-status-dot"/>{facility.status}</span> },
                    { label: 'Last Updated', value: formatDate(facility.lastUpdated), muted: true },
                    { label: 'Updated By',   value: facility.updatedBy },
                  ].filter(r => r.value).map(r => (
                    <div key={r.label} className="fac-info-row">
                      <span className="fac-info-label">{r.label}</span>
                      {typeof r.value === 'string'
                        ? <span className={`fac-info-value${r.mono?' mono':''}`} style={r.muted?{fontSize:'0.75rem',color:'var(--text-secondary)'}:{}}>{r.value}</span>
                        : r.value}
                    </div>
                  ))}
                  {facility.notes && (
                    <div className="fac-info-row" style={{ flexDirection:'column', gap:'0.4rem', alignItems:'flex-start' }}>
                      <span className="fac-info-label">Notes</span>
                      <span className="fac-info-value note">{facility.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                <div className="fac-coverage-card">
                  <div className="fac-detail-card-hd">
                    <span className="fac-detail-card-title">
                      Most Recent Grant{facility.coverageMonth && facility.coverageYear ? ` — ${MONTHS_SHORT[facility.coverageMonth-1]} ${facility.coverageYear}` : ''}
                    </span>
                    <button className="fac-tab" style={{ border:'none', padding:'0.25rem 0.5rem', borderRadius:4, fontSize:'0.7rem', height:'auto', marginBottom:0 }}
                      onClick={() => setActiveTab('coverage')}>View details</button>
                  </div>
                  {facility.mainGrant ? (
                    <div className="fac-main-grant-block">
                      <div className="fac-main-grant-icon"><Shield size={18} /></div>
                      <div className="fac-main-grant-info">
                        <div className="fac-main-grant-eyebrow">Main Grant</div>
                        <div className="fac-main-grant-name">{facility.mainGrant.name}</div>
                        <div className="fac-main-grant-code">{facility.mainGrant.code} · {facility.mainGrant.donor}</div>
                      </div>
                      <span className="fac-cov-status active">Active</span>
                    </div>
                  ) : (
                    <div style={{ padding:'1.25rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <AlertCircle size={16} color="var(--text-muted)" />
                      <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>No coverage record found</span>
                    </div>
                  )}
                  <div className="fac-sec-grant-section">
                    <div className="fac-sec-grant-eyebrow">Secondary Grants</div>
                    <span className="fac-no-secondary">No secondary grants for this period</span>
                  </div>
                  <div className="fac-cov-meta">
                    <div className="fac-cov-row"><span className="fac-cov-key">Donor</span><span className="fac-cov-val">{facility.mainGrant?.donor ?? '—'}</span></div>
                    <div className="fac-cov-row"><span className="fac-cov-key">Activities</span><span className="fac-cov-val" style={{ fontSize:'0.75rem' }}>Primary healthcare services</span></div>
                  </div>
                </div>

                {availableYears.length > 0 && (
                  <div className="fac-detail-card">
                    <div className="fac-detail-card-hd">
                      <span className="fac-detail-card-title">{historyYear} Coverage Timeline</span>
                      <button className="fac-tab" style={{ border:'none', padding:'0.25rem 0.5rem', borderRadius:4, fontSize:'0.7rem', height:'auto', marginBottom:0 }}
                        onClick={() => setActiveTab('history')}>Full history</button>
                    </div>
                    <div className="fac-detail-card-body" style={{ paddingBottom:'1rem' }}>
                      <div className="fac-timeline-grid" style={{ marginBottom:4 }}>
                        {MONTHS_SHORT.map((label, i) => {
                          const month = i + 1;
                          const rec   = coverage.find(c => c.year === historyYear && c.month === month);
                          const isCur = month === currentMonth && historyYear === currentYear;
                          return <div key={month} className={`fac-tl-month ${rec?'covered':'no-coverage'}${isCur?' active-month':''}`}
                            title={rec ? `${label} ${historyYear} — ${rec.mainGrant?.code}` : `${label} ${historyYear} — No coverage`}
                            onClick={() => setActiveTab('history')} />;
                        })}
                      </div>
                      <div className="fac-tl-labels">{MONTHS_SHORT.map(l => <span key={l} className="fac-tl-label">{l}</span>)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Coverage Tab ─────────────────────────────── */}
          {activeTab === 'coverage' && (
            <div className="fac-coverage-card">
              <div className="fac-detail-card-hd">
                <span className="fac-detail-card-title">
                  Most Recent Grant Coverage{facility.coverageMonth && facility.coverageYear ? ` — ${MONTHS_SHORT[facility.coverageMonth-1]} ${facility.coverageYear}` : ''}
                </span>
                {facility.mainGrant && <span className="fac-cov-status active">Active</span>}
              </div>
              {facility.mainGrant ? (
                <div className="fac-main-grant-block">
                  <div className="fac-main-grant-icon"><Shield size={20} /></div>
                  <div className="fac-main-grant-info">
                    <div className="fac-main-grant-eyebrow">Main Grant — Primary Funding Source</div>
                    <div className="fac-main-grant-name">{facility.mainGrant.name}</div>
                    <div className="fac-main-grant-code">{facility.mainGrant.code} · {facility.mainGrant.donor}</div>
                  </div>
                  <GrantBadge grant={facility.mainGrant} variant="main" />
                </div>
              ) : (
                <div style={{ padding:'1.5rem', color:'var(--text-secondary)', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <AlertCircle size={16} /> No active grant assignment found.
                </div>
              )}
              <div className="fac-sec-grant-section">
                <div className="fac-sec-grant-eyebrow">Secondary Grants</div>
                <span className="fac-no-secondary">No secondary grants for this coverage period</span>
              </div>
              <div className="fac-cov-meta">
                <div className="fac-cov-row"><span className="fac-cov-key">Donor</span><span className="fac-cov-val">{facility.mainGrant?.donor ?? '—'}</span></div>
                <div className="fac-cov-row"><span className="fac-cov-key">Total Records</span><span className="fac-cov-val">{coverage.length} months on file</span></div>
              </div>
            </div>
          )}

          {/* ── History Tab ───────────────────────────────── */}
          {activeTab === 'history' && (
            <div className="fac-history-section">
              {/* Header */}
              <div className="fac-history-hd">
                <div className="fac-history-hd-left">
                  <span className="fac-history-title">Coverage History</span>
                  {availableYears.length > 1 && (
                    <div className="fac-year-nav">
                      <button className="fac-year-btn" disabled={historyYear <= Math.min(...availableYears)} onClick={() => setHistoryYear(y => y-1)}><ChevronLeft size={12}/></button>
                      <span className="fac-year-display">{historyYear}</span>
                      <button className="fac-year-btn" disabled={historyYear >= Math.max(...availableYears)} onClick={() => setHistoryYear(y => y+1)}><ChevronRight size={12}/></button>
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  {availableYears.map(y => (
                    <button key={y} className={`fac-page-btn ${historyYear===y?'active':''}`} onClick={() => setHistoryYear(y)}
                      style={{ fontSize:'0.75rem', fontFamily:'var(--font-mono)' }}>{y}</button>
                  ))}
                  <div style={{ width:1, height:20, background:'var(--border-color)', margin:'0 0.25rem' }} />
                  <button className="fac-hd-btn" onClick={() => setEditRecord('new')} style={{ height:32, fontSize:'0.78rem' }}>
                    <Plus size={13} /> Add Record
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="fac-timeline-wrap">
                <div className="fac-timeline-eyebrow">Monthly Coverage — {historyYear}</div>
                <div className="fac-timeline-grid">
                  {timelineData.map(({ label, month, record }) => {
                    const isCur = month === currentMonth && historyYear === currentYear;
                    return (
                      <div key={month}
                        className={`fac-tl-month ${record?'covered':'no-coverage'}${isCur?' active-month':''}`}
                        title={record ? `${label} ${historyYear} · ${record.mainGrant?.code}` : `${label} ${historyYear} — No coverage`}
                        onClick={() => record && setEditRecord(record)}
                        style={{ cursor: record ? 'pointer' : 'default' }}
                      />
                    );
                  })}
                </div>
                <div className="fac-tl-labels">
                  {timelineData.map(({ label }) => <span key={label} className="fac-tl-label">{label}</span>)}
                </div>
                <div className="fac-timeline-legend">
                  <div className="fac-tl-legend-item"><div className="fac-tl-legend-dot covered"/>Covered</div>
                  <div className="fac-tl-legend-item"><div className="fac-tl-legend-dot none"/>No coverage</div>
                  <div className="fac-tl-legend-item" style={{ color:'var(--text-muted)', fontSize:'0.65rem' }}>Click a month bar to edit</div>
                  {historyYear === currentYear && (
                    <div className="fac-tl-legend-item" style={{ marginLeft:'auto' }}>
                      <div style={{ width:10, height:10, borderRadius:2, outline:'2px solid var(--primary-red)', outlineOffset:1 }}/>
                      Current month
                    </div>
                  )}
                </div>
              </div>

              {/* History Table */}
              <div className="fac-history-table-wrap">
                <table className="fac-history-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Main Grant</th>
                      <th>Donor</th>
                      <th>Status</th>
                      <th>Period</th>
                      <th>Activities</th>
                      <th>Updated</th>
                      <th>Updated By</th>
                      <th>Notes</th>
                      <th style={{ width:52, cursor:'default' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearHistory.length === 0 ? (
                      <tr><td colSpan={10}>
                        <div className="fac-empty" style={{ padding:'3rem 1rem' }}>
                          <div className="fac-empty-icon"><History size={20}/></div>
                          <div className="fac-empty-title">No coverage data for {historyYear}</div>
                          <div className="fac-empty-desc">
                            <button className="btn btn-ghost" style={{ marginTop:'0.5rem', height:32, fontSize:'0.78rem' }}
                              onClick={() => setEditRecord('new')}>
                              <Plus size={13} /> Add a record
                            </button>
                          </div>
                        </div>
                      </td></tr>
                    ) : yearHistory.map(rec => {
                      const isCur = rec.year === currentYear && rec.month === currentMonth;
                      return (
                        <tr key={rec.id} style={isCur?{ background:'rgba(24,95,165,0.03)' }:{}}>
                          <td>
                            <div className="fac-month-tag">
                              <span className="fac-month-name">
                                {MONTHS_SHORT[rec.month-1]}
                                {isCur && <span style={{ marginLeft:'0.375rem', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', background:'var(--grant-blue-bg)', color:'var(--grant-blue-text)', border:'1px solid var(--grant-blue-border)', borderRadius:3, padding:'0.1rem 0.35rem' }}>Current</span>}
                              </span>
                              <span className="fac-month-year">{rec.year}</span>
                            </div>
                          </td>
                          <td><GrantBadge grant={rec.mainGrant} variant="main"/></td>
                          <td style={{ fontSize:'0.75rem', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{rec.mainGrant?.donor ?? '—'}</td>
                          <td><CovStatusBadge status={rec.status}/></td>
                          <td>
                            <span style={{ fontSize:'0.72rem', fontFamily:'var(--font-mono)', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
                              {formatDate(rec.periodStart)?.split(' ').slice(0,2).join(' ')} – {formatDate(rec.periodEnd)?.split(' ').slice(0,2).join(' ')}
                            </span>
                          </td>
                          <td style={{ fontSize:'0.75rem', color:'var(--text-secondary)', maxWidth:180 }}>{rec.activities || '—'}</td>
                          <td style={{ fontSize:'0.72rem', fontFamily:'var(--font-mono)', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{formatDate(rec.updatedAt)}</td>
                          <td style={{ fontSize:'0.75rem', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{rec.updatedBy}</td>
                          <td style={{ fontSize:'0.72rem', color:'var(--text-muted)', maxWidth:160 }}>{rec.notes || <span style={{ opacity:0.35 }}>—</span>}</td>
                          <td>
                            <button className="fac-row-btn" title="Edit coverage record"
                              onClick={() => setEditRecord(rec)}>
                              <Edit2 size={13}/>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
