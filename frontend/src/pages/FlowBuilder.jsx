import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Edit3, Type, Info, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL, fetchApi } from '../config';

const FlowBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [metadata, setMetadata] = useState({
    title: '',
    subtitle: '',
    tagline: 'OPERATIONAL MANUAL',
    systemName: '',
    program: '',
    version: '1.0',
    documentDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  });

  const [sections, setSections] = useState([
    {
      id: Date.now(),
      title: 'Overview',
      subtitle: 'System Overview',
      blocks: [
        { id: Date.now() + 1, type: 'text', content: '' }
      ]
    }
  ]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      fetchApi(`${API_BASE_URL}/flows/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.BuilderState) {
            const state = JSON.parse(data.BuilderState);
            setMetadata(state.metadata || {
              title: data.Title,
              subtitle: data.Subtitle,
              tagline: '',
              systemName: data.SystemName,
              program: data.Program,
              version: data.Version,
              documentDate: data.DocumentDate
            });
            if (state.sections) {
              setSections(state.sections);
            }
          } else {
            // Un-editable flow
            alert('This flow was created manually and does not have a visual builder state. You can only view it.');
            navigate(`/flows/view/${id}`);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, navigate]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now(),
        title: 'New Section',
        subtitle: '',
        blocks: []
      }
    ]);
  };

  const removeSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const updateSection = (sectionId, field, value) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s));
  };

  const addBlock = (sectionId, type) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newBlock = type === 'text' 
          ? { id: Date.now(), type: 'text', content: '' }
          : { id: Date.now(), type: 'infobox', color: 'blue', title: 'Information', content: '' };
        return { ...s, blocks: [...s.blocks, newBlock] };
      }
      return s;
    }));
  };

  const removeBlock = (sectionId, blockId) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, blocks: s.blocks.filter(b => b.id !== blockId) };
      }
      return s;
    }));
  };

  const updateBlock = (sectionId, blockId, field, value) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          blocks: s.blocks.map(b => b.id === blockId ? { ...b, [field]: value } : b)
        };
      }
      return s;
    }));
  };

  const generateHTML = () => {
    const sidebarLinks = sections.map((s, i) => `
    <a class="nav-item ${i === 0 ? 'active' : ''}" href="#s${s.id}">
      <span class="nav-num">${String(i + 1).padStart(2, '0')}</span>${s.title}
    </a>`).join('');

    const sectionsHtml = sections.map((s, i) => `
      <section class="section" id="s${s.id}">
        <div class="section-header">
          <div class="section-num">${String(i + 1).padStart(2, '0')}</div>
          <div>
            <div class="section-title">${s.title}</div>
            ${s.subtitle ? `<div class="section-sub">${s.subtitle}</div>` : ''}
          </div>
        </div>
        
        ${s.blocks.map(b => {
          if (b.type === 'text') {
            return `<p class="prose">${b.content.replace(/\n/g, '<br/>')}</p>`;
          }
          if (b.type === 'infobox') {
            return `
            <div class="infobox ${b.color}">
              <div class="infobox-icon">ℹ</div>
              <div>
                <div class="infobox-title">${b.title}</div>
                <div class="infobox-body">${b.content.replace(/\n/g, '<br/>')}</div>
              </div>
            </div>`;
          }
          return '';
        }).join('')}
      </section>`).join('');

    return `
<style>
/* Basic fallback structural styles - full styles handled globally */
.flow-container-wrap { display: flex; min-height: 100vh; }
.flow-container-wrap .sidebar {
  width: var(--sidebar-w, 280px);
  flex-shrink: 0;
  position: sticky;
  top: 100px;
  align-self: flex-start;
  height: calc(100vh - 100px);
  overflow-y: auto;
  background: var(--teal-900, #03302A);
  display: flex;
  flex-direction: column;
}
</style>

<div class="flow-container-wrap">
  <nav class="sidebar" role="navigation">
    <div class="sidebar-brand">
      <div class="sidebar-brand-system">${metadata.systemName || 'System'}</div>
      <div class="sidebar-brand-title">${metadata.title || 'Flow Title'}</div>
      <div class="sidebar-brand-sub">Documentation v${metadata.version}</div>
    </div>
    <div class="sidebar-part">Sections</div>
    ${sidebarLinks}
  </nav>

  <main class="main">
    <div class="hero">
      <div class="hero-content">
        ${metadata.tagline ? `<div class="hero-tag"><div class="hero-tag-dot"></div>${metadata.tagline}</div>` : ''}
        <h1>${metadata.systemName}<br><em>${metadata.title}</em></h1>
        <p class="hero-sub">${metadata.subtitle}</p>
        
        <div class="hero-meta">
          <div class="hero-meta-item">
            <div class="hero-meta-label">Program</div>
            <div class="hero-meta-value">${metadata.program}</div>
          </div>
          <div class="hero-meta-item">
            <div class="hero-meta-label">Version</div>
            <div class="hero-meta-value">${metadata.version}</div>
          </div>
          <div class="hero-meta-item">
            <div class="hero-meta-label">Date</div>
            <div class="hero-meta-value">${metadata.documentDate}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-wrap">
      ${sectionsHtml}
    </div>
  </main>
</div>
`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...metadata,
      htmlContent: generateHTML(),
      builderState: {
        metadata,
        sections
      }
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/flows/${id}` : `${API_BASE_URL}/flows`;

    fetchApi(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save');
        return res.json();
      })
      .then(data => {
        setSaving(false);
        navigate(`/flows/view/${data.Id}`);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to save the flow.');
        setSaving(false);
      });
  };

  if (loading) {
    return <div className="page-content" style={{ padding: '2rem' }}>Loading flow...</div>;
  }

  return (
    <div className="page-content" style={{ paddingBottom: '4rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className="btn btn-ghost" 
          onClick={() => navigate('/flows')}
          style={{ padding: '0.5rem', borderRadius: '100px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Flow Builder</h1>
          <p className="page-subtitle">Build your operational manual without writing HTML.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bento-item" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>1. Hero Metadata</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group bento-col-2">
              <label>Title <span style={{ color: 'var(--primary-red)' }}>*</span></label>
              <input type="text" required className="form-control" value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} placeholder="e.g. Hospital Deliveries" />
            </div>
            <div className="form-group bento-col-2">
              <label>Subtitle</label>
              <input type="text" className="form-control" value={metadata.subtitle} onChange={e => setMetadata({...metadata, subtitle: e.target.value})} placeholder="e.g. Complete Operational Documentation" />
            </div>
            <div className="form-group">
              <label>System Name</label>
              <input type="text" className="form-control" value={metadata.systemName} onChange={e => setMetadata({...metadata, systemName: e.target.value})} placeholder="e.g. PHENICS" />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input type="text" className="form-control" value={metadata.tagline} onChange={e => setMetadata({...metadata, tagline: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Program</label>
              <input type="text" className="form-control" value={metadata.program} onChange={e => setMetadata({...metadata, program: e.target.value})} placeholder="e.g. Patient Care" />
            </div>
            <div className="form-group">
              <label>Version</label>
              <input type="text" className="form-control" value={metadata.version} onChange={e => setMetadata({...metadata, version: e.target.value})} />
            </div>
            <div className="form-group bento-col-2">
              <label>Document Date</label>
              <input type="text" className="form-control" value={metadata.documentDate} onChange={e => setMetadata({...metadata, documentDate: e.target.value})} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>2. Document Sections</h3>
          <button type="button" className="btn btn-ghost" onClick={addSection}>
            <Plus size={16} /> Add Section
          </button>
        </div>

        {sections.map((section, index) => (
          <div key={section.id} className="bento-item" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'var(--surface-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ background: 'var(--primary-red)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Section Title" 
                    value={section.title}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    style={{ fontWeight: 600, fontSize: '1.1rem' }}
                    required
                  />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Optional Subtitle" 
                    value={section.subtitle}
                    onChange={(e) => updateSection(section.id, 'subtitle', e.target.value)}
                  />
                </div>
              </div>
              <button type="button" className="icon-btn" onClick={() => removeSection(section.id)}>
                <Trash2 size={18} />
              </button>
            </div>

            {/* Blocks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {section.blocks.map((block) => (
                <div key={block.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ paddingTop: '0.5rem', color: 'var(--text-muted)' }}><GripVertical size={16} /></div>
                  
                  <div style={{ flex: 1 }}>
                    {block.type === 'text' && (
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Type size={14} /> Text Block
                        </label>
                        <textarea 
                          className="form-control" 
                          rows={4}
                          placeholder="Write your content here..."
                          value={block.content}
                          onChange={(e) => updateBlock(section.id, block.id, 'content', e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {block.type === 'infobox' && (
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <AlertCircle size={14} /> Info Box Title
                            </label>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="e.g. Warning, Note, Tip"
                              value={block.title}
                              onChange={(e) => updateBlock(section.id, block.id, 'title', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group" style={{ width: '150px' }}>
                            <label>Color</label>
                            <select 
                              className="form-control"
                              value={block.color}
                              onChange={(e) => updateBlock(section.id, block.id, 'color', e.target.value)}
                            >
                              <option value="blue">Blue</option>
                              <option value="teal">Teal</option>
                              <option value="amber">Amber</option>
                              <option value="coral">Red / Coral</option>
                              <option value="green">Green</option>
                              <option value="purple">Purple</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <textarea 
                            className="form-control" 
                            rows={3}
                            placeholder="Info box content..."
                            value={block.content}
                            onChange={(e) => updateBlock(section.id, block.id, 'content', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="button" className="icon-btn" onClick={() => removeBlock(section.id, block.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => addBlock(section.id, 'text')} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                <Plus size={14} /> Text Block
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => addBlock(section.id, 'infobox')} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                <Plus size={14} /> Info Box
              </button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/flows')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {saving ? 'Compiling & Saving...' : 'Save Flow Manual'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlowBuilder;
