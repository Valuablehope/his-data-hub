import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Download } from 'lucide-react';
import { API_BASE_URL, fetchApi } from '../config';
import { AuthContext } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const FlowViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchApi(`${API_BASE_URL}/flows/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Flow not found');
        return res.json();
      })
      .then(data => {
        setFlow(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load flow:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id, token]);

  // Inject a custom version picker dropdown into the hero's Version meta field.
  // The panel is appended to document.body (position:fixed) to escape the
  // hero's overflow:hidden, then positioned via getBoundingClientRect().
  useEffect(() => {
    if (loading || !flow) return;
    const versions = flow.versions || [];
    if (versions.length <= 1) return;

    let panel = null;
    let outsideHandler = null;
    let scrollHandler = null;
    let isOpen = false;
    let closePanel = null;

    const timeoutId = setTimeout(() => {
      const metaItems = document.querySelectorAll('.flow-viewer-content .hero-meta-item');

      metaItems.forEach(item => {
        const lbl = item.querySelector('.hero-meta-label');
        if (!lbl || lbl.textContent.trim() !== 'Version') return;

        const valueEl = item.querySelector('.hero-meta-value');
        if (!valueEl || valueEl.querySelector('.ver-trigger')) return;

        const current = versions.find(v => v.Id === flow.Id) || versions[versions.length - 1];

        // ── Trigger button ──────────────────────────────────────
        const trigger = document.createElement('button');
        trigger.className = 'ver-trigger';
        trigger.style.cssText = `
          display:inline-flex;align-items:center;gap:7px;
          font-size:13px;font-weight:600;color:#fff;font-family:inherit;
          background:rgba(255,255,255,0.09);
          border:1px solid rgba(255,255,255,0.18);
          border-radius:7px;padding:5px 10px 5px 12px;
          cursor:pointer;outline:none;line-height:1;user-select:none;
          transition:background 0.15s,border-color 0.15s;
        `;

        const triggerLabel = document.createElement('span');
        triggerLabel.textContent = `v${current.Version}${current.DocumentDate ? ' · ' + current.DocumentDate : ''}`;

        const chevronWrap = document.createElement('span');
        chevronWrap.style.cssText = 'display:flex;align-items:center;opacity:0.55;transition:transform 0.2s ease;';
        chevronWrap.innerHTML = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 4L5.5 7.5L9 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        trigger.appendChild(triggerLabel);
        trigger.appendChild(chevronWrap);

        // ── Floating panel (appended to body) ───────────────────
        panel = document.createElement('div');
        panel.className = 'ver-picker-panel';
        panel.style.cssText = `
          display:none;position:fixed;z-index:9999;
          min-width:210px;
          background:rgba(8,26,32,0.97);
          border:1px solid rgba(255,255,255,0.11);
          border-radius:10px;
          box-shadow:0 16px 48px rgba(0,0,0,0.55),0 2px 8px rgba(0,0,0,0.3);
          overflow:hidden;
          font-family:inherit;
        `;

        // Panel header
        const header = document.createElement('div');
        header.style.cssText = `
          padding:9px 14px 8px;
          font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
          color:rgba(255,255,255,0.28);
          border-bottom:1px solid rgba(255,255,255,0.07);
        `;
        header.textContent = 'Switch Version';
        panel.appendChild(header);

        // Options
        versions.forEach((v, i) => {
          const isCurrent = v.Id === flow.Id;
          const opt = document.createElement('button');
          opt.style.cssText = `
            display:flex;align-items:center;justify-content:space-between;gap:12px;
            width:100%;text-align:left;
            padding:11px 14px;
            font-size:13px;font-weight:${isCurrent ? 600 : 500};
            color:${isCurrent ? '#fff' : 'rgba(255,255,255,0.6)'};
            background:${isCurrent ? 'rgba(255,255,255,0.07)' : 'transparent'};
            border:none;border-top:${i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none'};
            cursor:${isCurrent ? 'default' : 'pointer'};outline:none;font-family:inherit;
            transition:background 0.12s,color 0.12s;
          `;

          const optLabel = document.createElement('span');
          optLabel.textContent = `v${v.Version}${v.DocumentDate ? ' · ' + v.DocumentDate : ''}`;
          opt.appendChild(optLabel);

          if (isCurrent) {
            const badge = document.createElement('span');
            badge.textContent = 'Current';
            badge.style.cssText = `
              font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;
              background:rgba(20,184,166,0.18);color:rgba(94,234,212,0.85);
              border:1px solid rgba(94,234,212,0.18);border-radius:4px;
              padding:2px 7px;flex-shrink:0;
            `;
            opt.appendChild(badge);
          } else {
            opt.addEventListener('mouseenter', () => {
              opt.style.background = 'rgba(255,255,255,0.07)';
              opt.style.color = '#fff';
            });
            opt.addEventListener('mouseleave', () => {
              opt.style.background = 'transparent';
              opt.style.color = 'rgba(255,255,255,0.6)';
            });
            opt.addEventListener('click', e => {
              e.stopPropagation();
              navigate(`/flows/view/${v.Id}`);
            });
          }

          panel.appendChild(opt);
        });

        document.body.appendChild(panel);

        // ── Open / close logic ──────────────────────────────────
        const openPanel = () => {
          isOpen = true;
          const rect = trigger.getBoundingClientRect();
          panel.style.top  = `${rect.bottom + 6}px`;
          panel.style.left = `${rect.left}px`;
          panel.style.display = 'block';
          trigger.style.background   = 'rgba(255,255,255,0.15)';
          trigger.style.borderColor  = 'rgba(255,255,255,0.28)';
          chevronWrap.style.transform = 'rotate(180deg)';
        };

        closePanel = () => {
          isOpen = false;
          panel.style.display = 'none';
          trigger.style.background  = 'rgba(255,255,255,0.09)';
          trigger.style.borderColor = 'rgba(255,255,255,0.18)';
          chevronWrap.style.transform = 'rotate(0deg)';
        };

        trigger.addEventListener('mouseenter', () => { if (!isOpen) trigger.style.background = 'rgba(255,255,255,0.13)'; });
        trigger.addEventListener('mouseleave', () => { if (!isOpen) trigger.style.background = 'rgba(255,255,255,0.09)'; });
        trigger.addEventListener('click', e => { e.stopPropagation(); isOpen ? closePanel() : openPanel(); });

        valueEl.innerHTML = '';
        valueEl.appendChild(trigger);
      });

      // Close on outside click or scroll
      outsideHandler = () => { if (closePanel) closePanel(); };
      scrollHandler  = () => { if (closePanel) closePanel(); };
      document.addEventListener('click', outsideHandler);
      window.addEventListener('scroll', scrollHandler, true);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      if (outsideHandler) document.removeEventListener('click', outsideHandler);
      if (scrollHandler)  window.removeEventListener('scroll', scrollHandler, true);
      // Remove the floating panel from body
      document.querySelectorAll('.ver-picker-panel').forEach(p => p.remove());
    };
  }, [loading, flow, navigate]);

  // Scrollspy effect to highlight active section in sidebar
  useEffect(() => {
    if (loading || !flow) return;

    const timeoutId = setTimeout(() => {
      const navLinks = document.querySelectorAll('.flow-viewer-content .nav-item');
      if (navLinks.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinks.forEach(link => {
              if (link.getAttribute('href') === '#' + entry.target.id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }, {
        rootMargin: '-120px 0px -70% 0px',
        threshold: 0
      });

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const section = document.querySelector(href);
          if (section) observer.observe(section);
        }
      });

      // Allow clicking links to smooth scroll
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            const section = document.querySelector(href);
            if (section) {
              section.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      });

      return () => {
        observer.disconnect();
      };
    }, 100); // slight delay to ensure HTML is injected and rendered

    return () => clearTimeout(timeoutId);
  }, [loading, flow]);

  const exportPDF = async () => {
    if (exporting) return;
    setExporting(true);

    // Unfix the sticky sidebar so html2canvas captures the full document height
    const overrideStyle = document.createElement('style');
    overrideStyle.textContent = `
      .flow-container-wrap .sidebar {
        position: static !important;
        height: auto !important;
        overflow-y: visible !important;
        align-self: stretch !important;
      }
    `;
    document.head.appendChild(overrideStyle);

    // Let the style override paint before we capture
    await new Promise(r => setTimeout(r, 120));

    try {
      const element = document.querySelector('.flow-viewer-content');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        backgroundColor: '#f4f4f6',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.97);
      const imgW = canvas.width;
      const imgH = canvas.height;

      // Landscape A4: 297 mm × 210 mm
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();   // 297
      const pageH = pdf.internal.pageSize.getHeight();  // 210

      // Scale the full image to fit the page width
      const totalImgH = (imgH / imgW) * pageW;
      const pages = Math.ceil(totalImgH / pageH);

      for (let i = 0; i < pages; i++) {
        if (i > 0) pdf.addPage();
        // Shift the image up by (i * pageH) so the next slice appears at the top
        pdf.addImage(imgData, 'JPEG', 0, -(i * pageH), pageW, totalImgH);
      }

      const filename = (flow.Title || 'flow-manual')
        .replace(/[^a-z0-9\s]/gi, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      pdf.save(`${filename}.pdf`);

    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      document.head.removeChild(overrideStyle);
      setExporting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading manual...</div>;
  }

  if (error || !flow) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Error loading manual</h3>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/flows')}>Back to Manuals</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 2rem 1rem 2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          onClick={() => navigate(`/flows/edit/${id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--primary-red)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontWeight: 600,
            color: 'white'
          }}
        >
          <Edit3 size={16} /> Edit Flow
        </button>
        <button
          onClick={exportPDF}
          disabled={exporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: exporting ? 'var(--surface-hover)' : 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            cursor: exporting ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            color: exporting ? 'var(--text-muted)' : 'var(--text-primary)',
            opacity: exporting ? 0.7 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          <Download size={16} style={exporting ? { animation: 'spin 1s linear infinite' } : {}} />
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
        <button
          onClick={() => navigate('/flows')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>

      {/* Inject raw HTML */}
      <div
        className="flow-viewer-content"
        dangerouslySetInnerHTML={{ __html: flow.HtmlContent }}
      />
    </div>
  );
};

export default FlowViewer;
