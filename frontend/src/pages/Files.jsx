import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, File as FileIcon, Download, Clock, User, FileText, FileBadge, Trash2 } from 'lucide-react';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchFiles = () => {
    fetch('http://localhost:5000/api/files')
      .then(res => res.json())
      .then(data => {
        setFiles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch files:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      alert("Only PDF and Word documents are allowed.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    fetch('http://localhost:5000/api/files/upload', {
      method: 'POST',
      body: formData,
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      return res.json();
    })
    .then(data => {
      setUploading(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      // refresh files list
      fetchFiles();
    })
    .catch(err => {
      console.error("Upload error:", err);
      alert("Failed to upload file.");
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    fetch(`http://localhost:5000/api/files/${id}`, {
      method: 'DELETE',
    })
    .then(res => {
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    })
    .then(() => {
      fetchFiles();
    })
    .catch(err => {
      console.error("Delete error:", err);
      alert("Failed to delete file.");
    });
  };

  const getFileIcon = (mimeType, fileName) => {
    if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      return <FileBadge size={24} color="#EF4444" />; // Red for PDF
    }
    return <FileText size={24} color="#3B82F6" />; // Blue for Word
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Document Vault</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Upload and share essential documents (PDF, DOCX) across the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="file" 
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
          />
          <button 
            className="btn btn-primary" 
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UploadCloud size={18} />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem' }}>Loading documents...</div>
      ) : files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <FileIcon size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem' }}>No documents uploaded yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Click the upload button above to add your first document.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {files.map(file => (
            <div key={file.Id} className="bento-item" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.03)', borderRadius: 'var(--radius-md)' }}>
                  {getFileIcon(file.MimeType, file.OriginalName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.OriginalName}>
                    {file.OriginalName}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatBytes(file.Size)}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={12} /> {file.UploadedBy}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {new Date(file.CreatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => handleDelete(file.Id)}
                    style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(227,0,15,0.05)', color: 'var(--primary-red)' }}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  <a 
                    href={`http://localhost:5000/api/files/download/${file.Id}`} 
                    className="btn btn-ghost" 
                    style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(0,0,0,0.03)' }}
                    title="Download"
                    download
                  >
                    <Download size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Files;
