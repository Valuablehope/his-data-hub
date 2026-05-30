import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';

const FlowViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
