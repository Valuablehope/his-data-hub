import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import '../markdown.css';
import { FileText, BookOpen, Clock } from 'lucide-react';

const Documentation = () => {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/docs')
      .then(res => res.json())
      .then(data => {
        setDocs(data);
        if (data.length > 0) {
          selectDocument(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const selectDocument = (doc) => {
    setSelectedDoc(doc);
    setContent('Loading content...');
    fetch(`http://localhost:5000/api/docs/${doc.Id}`)
      .then(res => res.json())
      .then(data => setContent(data.content))
      .catch(() => setContent('Error loading document content.'));
  };

  return (
    <div className="page-content" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)' }}>
      
      <div className="bento-item" style={{ width: '350px', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} color="var(--primary-red)" /> Document Library
        </h2>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading documents...</div>
          ) : docs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No documents found.</div>
          ) : (
            docs.map(doc => (
              <button 
                key={doc.Id}
                onClick={() => selectDocument(doc)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  background: selectedDoc?.Id === doc.Id ? 'rgba(227, 0, 15, 0.1)' : 'transparent',
                  border: `1px solid ${selectedDoc?.Id === doc.Id ? 'rgba(227, 0, 15, 0.3)' : 'transparent'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: selectedDoc?.Id === doc.Id ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem', textAlign: 'left' }}>{doc.Title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FileText size={12} /> {doc.Category}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                    <Clock size={12} /> {new Date(doc.UpdatedAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="bento-item" style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        {selectedDoc ? (
          <div className="markdown-body" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(0,0,0,0.05)', borderRadius: '100px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {selectedDoc.Category}
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                {selectedDoc.Title}
              </h1>
            </div>
            
            <div style={{ lineHeight: 1.7, fontSize: '1rem', color: 'var(--text-secondary)' }}>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Select a document from the library to view it here.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Documentation;
