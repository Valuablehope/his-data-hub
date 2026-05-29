import React, { useState } from 'react';
import { ClipboardCheck, PlusCircle, Calendar, ShieldAlert, Loader2 } from 'lucide-react';

const mockFormTemplates = [
  { id: 'data_access', category_id: 1, title: 'Data Access Request', icon: ShieldAlert, description: 'Request access to restricted PHENICS modules or data warehouses.' },
  { id: 'new_flow', category_id: 2, title: 'New Flow Proposal', icon: PlusCircle, description: 'Submit a technical proposal for a new data pipeline integration.' },
  { id: 'incident', category_id: 3, title: 'Incident Report', icon: ClipboardCheck, description: 'Log a data inconsistency or synchronization failure.' },
];

const Forms = () => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });

  const handleSelectForm = (template) => {
    setSelectedForm(template);
    setFormData({
      ...formData,
      title: `${template.title} - `
    });
    setSubmitMessage(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category_id: selectedForm.category_id,
        priority: formData.priority,
        source_channel: 'HIS Data Hub Portal'
      };

      const response = await fetch('http://localhost:5000/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit the form');
      }

      const result = await response.json();
      setSubmitMessage({ type: 'success', text: `Ticket created successfully! Reference: ${result.ticket?.reference_code || 'N/A'}` });
      setFormData({ title: '', description: '', priority: 'Medium' });
      
      // Auto-close after a few seconds
      setTimeout(() => setSelectedForm(null), 3000);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error.message || 'An error occurred while submitting the ticket.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Activity Forms</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Submit official requests, incident logs, and proposals directly to the TIXO Helpdesk.</p>
        </div>
      </div>

      {!selectedForm ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {mockFormTemplates.map(template => {
            const Icon = template.icon;
            return (
              <button 
                key={template.id} 
                className="bento-item" 
                onClick={() => handleSelectForm(template)}
                style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--surface-color)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)' }}>
                    <Icon size={24} color="var(--primary-red)" />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>{template.title}</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{template.description}</p>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="bento-item" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem' }}>
          <button 
            className="btn btn-ghost" 
            onClick={() => setSelectedForm(null)}
            style={{ marginBottom: '2rem', padding: '0.5rem 0' }}
          >
            ← Back to Forms
          </button>
          
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            Submit Ticket: {selectedForm.title}
          </h2>

          {submitMessage && (
            <div style={{ 
              padding: '1rem', 
              marginBottom: '1.5rem', 
              borderRadius: 'var(--radius-md)', 
              background: submitMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: submitMessage.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${submitMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Ticket Title</label>
              <input 
                type="text" 
                name="title"
                required 
                value={formData.title}
                onChange={handleInputChange}
                style={{ padding: '0.75rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} 
                placeholder="Brief summary of the issue or request" 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Priority</label>
              <select 
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                style={{ padding: '0.75rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Detailed Description</label>
              <textarea 
                name="description"
                required 
                value={formData.description}
                onChange={handleInputChange}
                rows={5} 
                style={{ padding: '0.75rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }} 
                placeholder="Please describe your request in detail..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setSelectedForm(null)} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Forms;
