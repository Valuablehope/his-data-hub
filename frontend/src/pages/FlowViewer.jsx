import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const FlowViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/flows/${id}`)
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
  }, [id]);

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
