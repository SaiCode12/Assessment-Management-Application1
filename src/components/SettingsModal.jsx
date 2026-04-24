import React, { useState } from 'react';

const SettingsModal = ({ onClose, onConfirm, questionTypes }) => {
  const [config, setConfig] = useState(
    questionTypes.map(t => ({ type: t.value, label: t.label, enabled: false, count: 3 }))
  );

  const toggle = (i) =>
    setConfig(c => c.map((item, idx) => idx === i ? { ...item, enabled: !item.enabled } : item));

  const setCount = (i, val) =>
    setConfig(c => c.map((item, idx) => idx === i ? { ...item, count: Math.max(1, Math.min(20, Number(val))) } : item));

  const handleConfirm = () => {
    const selected = config.filter(c => c.enabled && c.count > 0);
    if (selected.length === 0) { alert('Please select at least one question type'); return; }
    onConfirm(selected);
  };

  const total = config.filter(c => c.enabled).reduce((s, c) => s + c.count, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">⚙️ Question Settings</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>
          Choose question types and how many of each to add.
        </p>

        <div className="settings-types">
          {config.map((item, i) => (
            <div key={item.type} className={`settings-type-row ${item.enabled ? 'enabled' : ''}`}>
              <label className="checkbox-label">
                <input type="checkbox" checked={item.enabled} onChange={() => toggle(i)} />
                <span className="type-name">{item.label}</span>
              </label>
              {item.enabled && (
                <div className="count-control">
                  <button onClick={() => setCount(i, item.count - 1)} className="count-btn">−</button>
                  <span className="count-val">{item.count}</span>
                  <button onClick={() => setCount(i, item.count + 1)} className="count-btn">+</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {total > 0 && (
          <div className="settings-summary">
            <span>Total questions to add: </span>
            <strong>{total}</strong>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm}>Add {total || ''} Questions</button>
        </div>
      </div>

      <style>{`
        .settings-types { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .settings-type-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--bg3);
          transition: all 0.2s;
        }
        .settings-type-row.enabled { border-color: var(--accent); background: rgba(108,99,255,0.08); }
        .type-name { font-size: 14px; color: var(--text); }
        .count-control { display: flex; align-items: center; gap: 12px; }
        .count-btn {
          width: 28px; height: 28px; border-radius: 6px;
          background: var(--surface2); border: 1px solid var(--border2);
          color: var(--text); cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .count-btn:hover { background: var(--accent); border-color: var(--accent); }
        .count-val { font-weight: 700; font-size: 16px; min-width: 20px; text-align: center; }
        .settings-summary {
          padding: 12px 16px; background: rgba(108,99,255,0.1);
          border-radius: 8px; border: 1px solid rgba(108,99,255,0.2);
          font-size: 14px; color: var(--text2); margin-bottom: 20px;
        }
        .settings-summary strong { color: var(--accent3); font-size: 16px; }
        .modal-footer { display: flex; gap: 10px; justify-content: flex-end; }
      `}</style>
    </div>
  );
};

export default SettingsModal;
