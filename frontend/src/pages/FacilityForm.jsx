import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, Check, Save, Building2, ChevronDown } from 'lucide-react';
import { API_BASE_URL, fetchApi } from '../config';
import { AuthContext } from '../context/AuthContext';
import '../facilities.css';

const FACILITY_TYPES = ['PHCC', 'Referral Hospital', 'Teaching Hospital'];
const AREAS  = ['South','Nabatiyeh','BML','Aley','Chouf','Saida','Hasbaya','Bint Jbeil','AKKAR','Tripoli','Minnieh','Baalbek','Hermel'];
const BASES  = ['Saida', 'Tripoli'];
const STATUSES = ['Active', 'Suspended', 'Inactive'];

/* ─── MultiSelect Component ──────────────────────────────── */
function MultiSelect({ value = [], onChange, options, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
  };

  const selected = options.filter(o => value.includes(o.id));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="fac-multiselect"
        onClick={() => setOpen(v => !v)}
        style={{ minHeight: 36, cursor: 'pointer' }}
      >
        {selected.length === 0 ? (
          <span className="fac-ms-placeholder">{placeholder}</span>
        ) : selected.map(g => (
          <span key={g.id} className="fac-ms-chip">
            {g.code}
            <button
              className="fac-ms-chip-rm"
              onClick={e => { e.stopPropagation(); toggle(g.id); }}
            >
              <X size={9} />
            </button>
          </span>
        ))}
        <ChevronDown size={12} style={{ marginLeft: 'auto', color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>
      {open && (
        <div className="fac-ms-dropdown">
          {options.map(opt => {
            const isSel = value.includes(opt.id);
            return (
              <div
                key={opt.id}
                className={`fac-ms-option ${isSel ? 'selected' : ''}`}
                onClick={() => toggle(opt.id)}
              >
                <div className="fac-ms-check">
                  {isSel && <Check size={9} color="white" />}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>{opt.code}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>{opt.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function FacilityForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const { token } = useContext(AuthContext);

  const [grants,  setGrants]  = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    name: '', type: '', area: '', base: '',
    address: '', coordinates: '', status: 'Active',
    mainGrantId: '', secondaryGrantIds: [], notes: '',
  });

  // Load grants + existing facility data (for edit)
  useEffect(() => {
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };
    const reqs = [
      fetchApi(`${API_BASE_URL}/facilities/meta/grants`, authHeaders).then(r => r.json()),
    ];
    if (isEdit) reqs.push(fetchApi(`${API_BASE_URL}/facilities/${id}`, authHeaders).then(r => r.json()));

    Promise.all(reqs).then(([grnts, fac]) => {
      setGrants(grnts);
      if (fac) {
        setForm({
          name: fac.name || '', type: fac.type || '', area: fac.area || '',
          base: fac.base || '', address: fac.address || '',
          coordinates: fac.coordinates || '', status: fac.status || 'Active',
          mainGrantId: fac.mainGrant?.id || '', secondaryGrantIds: [], notes: fac.notes || '',
        });
      }
    }).catch(console.error);
  }, [id, token]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setTouched(t => ({ ...t, [key]: true }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name       = 'Facility name is required';
    if (!form.type)        e.type       = 'Facility type is required';
    if (!form.area)        e.area       = 'Area is required';
    if (!form.base)        e.base       = 'Base is required';
    if (!form.status)      e.status     = 'Status is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched(Object.fromEntries(Object.keys(errs).map(k => [k, true])));
      return;
    }

    setSaving(true);
    try {
      const url    = isEdit ? `${API_BASE_URL}/facilities/${id}` : `${API_BASE_URL}/facilities`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetchApi(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name:              form.name,
          type:              form.type,
          area:              form.area,
          base:              form.base,
          address:           form.address   || null,
          coordinates:       form.coordinates || null,
          status:            form.status,
          notes:             form.notes     || null,
          updatedBy:         'admin',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }
      navigate('/facilities');
    } catch (err) {
      alert(err.message || 'Failed to save facility.');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, required, hint, children }) => (
    <div className="fac-form-group">
      <label className="fac-form-label">
        {label}
        {required && <span className="fac-form-required">*</span>}
      </label>
      {children}
      {touched[name] && errors[name] && (
        <span className="fac-form-error">{errors[name]}</span>
      )}
      {hint && !errors[name] && <span className="fac-form-hint">{hint}</span>}
    </div>
  );

  return (
    <div className="fac-form-page">
      {/* Back */}
      <button className="fac-back" onClick={() => navigate('/facilities')}>
        <ArrowLeft size={13} /> Back to Facilities
      </button>

      <div className="fac-form-card">
        {/* Header */}
        <div className="fac-form-hd">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(0,0,0,0.04)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Building2 size={16} />
            </div>
            <div>
              <div className="fac-form-hd-title">{isEdit ? 'Edit Facility' : 'Add New Facility'}</div>
              <div className="fac-form-hd-sub">
                {isEdit ? `Editing ${form.name || 'facility'}` : 'Register a new PHCC with grant coverage details'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fac-form-body">
            {/* Section: Basic Info */}
            <div className="fac-form-section">
              <div className="fac-form-section-title">Basic Information</div>
              <div className="fac-form-grid">
                {/* Name — full width */}
                <div className="fac-form-full">
                  <Field label="Facility Name" name="name" required>
                    <input
                      className={`fac-form-input ${touched.name && errors.name ? 'error' : ''}`}
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="e.g. Aleppo Central Health Center"
                      autoFocus
                    />
                  </Field>
                </div>

                {/* Type */}
                <Field label="Facility Type" name="type" required>
                  <select
                    className={`fac-form-select ${touched.type && errors.type ? 'error' : ''}`}
                    value={form.type}
                    onChange={e => set('type', e.target.value)}
                  >
                    <option value="">Select type…</option>
                    {FACILITY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>

                {/* Status */}
                <Field label="Operational Status" name="status" required>
                  <select
                    className="fac-form-select"
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Section: Location */}
            <div className="fac-form-section">
              <div className="fac-form-section-title">Location</div>
              <div className="fac-form-grid">
                <Field label="Area / Zone" name="area" required>
                  <select
                    className={`fac-form-select ${touched.area && errors.area ? 'error' : ''}`}
                    value={form.area}
                    onChange={e => set('area', e.target.value)}
                  >
                    <option value="">Select area…</option>
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </Field>

                <Field label="Operational Base" name="base" required>
                  <select
                    className={`fac-form-select ${touched.base && errors.base ? 'error' : ''}`}
                    value={form.base}
                    onChange={e => set('base', e.target.value)}
                  >
                    <option value="">Select base…</option>
                    {BASES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </Field>

                <div className="fac-form-full">
                  <Field label="Address" name="address" hint="Street address or location description">
                    <input
                      className="fac-form-input"
                      value={form.address}
                      onChange={e => set('address', e.target.value)}
                      placeholder="e.g. 14 Al-Farabi Street, Aleppo, Syria"
                    />
                  </Field>
                </div>

                <Field label="Coordinates" name="coordinates" hint="Optional GPS coordinates">
                  <input
                    className="fac-form-input"
                    value={form.coordinates}
                    onChange={e => set('coordinates', e.target.value)}
                    placeholder="e.g. 36.2021° N, 37.1343° E"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
                  />
                </Field>
              </div>
            </div>

            {/* Section: Grant Coverage */}
            <div className="fac-form-section">
              <div className="fac-form-section-title">Grant Coverage</div>
              <div className="fac-form-grid">
                <Field label="Main Grant" name="mainGrantId" required hint="Primary funding grant for this facility">
                  <select
                    className={`fac-form-select ${touched.mainGrantId && errors.mainGrantId ? 'error' : ''}`}
                    value={form.mainGrantId}
                    onChange={e => set('mainGrantId', Number(e.target.value))}
                  >
                    <option value="">Select main grant…</option>
                    {grants.map(g => (
                      <option key={g.id} value={g.id}>{g.code} — {g.name}</option>
                    ))}
                  </select>
                </Field>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label className="fac-form-label">Secondary Grants</label>
                  <MultiSelect
                    value={form.secondaryGrantIds}
                    onChange={val => set('secondaryGrantIds', val)}
                    options={grants.filter(g => g.id !== form.mainGrantId)}
                    placeholder="Select secondary grants…"
                  />
                  <span className="fac-form-hint">Optional — supplementary funding sources</span>
                </div>
              </div>
            </div>

            {/* Section: Notes */}
            <div className="fac-form-section" style={{ marginBottom: 0 }}>
              <div className="fac-form-section-title">Additional Notes</div>
              <div className="fac-form-group">
                <label className="fac-form-label">Notes</label>
                <textarea
                  className="fac-form-textarea"
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Operational notes, capacity details, access conditions…"
                  rows={4}
                />
                <span className="fac-form-hint">Internal notes visible to all platform users</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="fac-form-ft">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/facilities')}
              style={{ height: 36, fontSize: '0.8rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ height: 36, fontSize: '0.8rem', minWidth: 120 }}
            >
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Saving…
                </span>
              ) : (
                <><Save size={13} /> {isEdit ? 'Save Changes' : 'Add Facility'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
