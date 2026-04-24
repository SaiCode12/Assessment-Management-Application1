import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const LoadCategoriesModal = ({ onClose, onLoad }) => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) =>
    setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);

  const handleLoad = () => {
    const chosen = categories.filter(c => selected.includes(c._id));
    onLoad(chosen);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📂 Load Categories</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>
          Select previously created categories to reuse in this assessment.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <div className="empty-icon">📭</div>
            <div className="empty-title">No saved categories</div>
            <div className="empty-text">Save an assessment first to reuse its categories here.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {categories.map(cat => (
              <div
                key={cat._id}
                className={`load-cat-row ${selected.includes(cat._id) ? 'selected' : ''}`}
                onClick={() => toggle(cat._id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="checkbox" checked={selected.includes(cat._id)} readOnly
                    style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</div>
                    {cat.description && (
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{cat.description}</div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {cat.factors?.length || 0} factor(s)
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleLoad} disabled={selected.length === 0}>
            Load Selected ({selected.length})
          </button>
        </div>
      </div>

      <style>{`
        .load-cat-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--bg3);
          cursor: pointer; transition: all 0.15s;
        }
        .load-cat-row:hover { border-color: var(--border2); background: var(--surface2); }
        .load-cat-row.selected { border-color: var(--accent); background: rgba(108,99,255,0.1); }
      `}</style>
    </div>
  );
};

export default LoadCategoriesModal;
