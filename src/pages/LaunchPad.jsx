import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import '../css/LaunchPad.css';

import {
  Rocket,
  Search,
  FileText,
  Play,
  User,
  Layers
} from 'lucide-react';
const LaunchPad = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/assessments/all')
      .then(res => setAssessments(res.data))
      .catch(() => toast.error('Failed to load assessments'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assessments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const countQuestions = (a) =>
    (a.categories || []).reduce((t, c) =>
      t + (c.factors || []).reduce((ft, f) => ft + (f.questions || []).length, 0), 0);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="launchpad-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">  <Rocket size={22} style={{ marginRight: 8 }} /> Launch Pad</h1>
          <p className="page-subtitle">Select an assessment to begin taking it</p>
        </div>
      </div>

      <div className="lp-search">
        <span className="search-icon"> <Search size={16} /></span>
        <input
          className="form-control search-input"
          placeholder="Search assessments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"> <Rocket size={40} /></div>
          <div className="empty-title">{search ? 'No results found' : 'No assessments available'}</div>
          <div className="empty-text">
            {search ? 'Try a different search term' : 'Ask an admin to create assessments in the Builder'}
          </div>
        </div>
      ) : (
        <div className="lp-grid">
          {filtered.map(a => (
            <div key={a._id} className="lp-card" onClick={() => navigate(`/launchpad/${a._id}`)}>
              <div className="lp-card-glow"></div>
              <div className="lp-card-content">
                <div className="lp-card-top">
                  <div className="lp-badge">Assessment</div>
                  <div className="lp-question-count">{countQuestions(a)} Q</div>
                </div>
                <h3 className="lp-title">{a.title}</h3>
                {a.description && <p className="lp-desc">{a.description}</p>}
                <div className="lp-meta">
                  <span><User size={14} style={{ marginRight: 4 }} />By {a.createdBy?.name || 'Unknown'}</span>
                  <span>·</span>
                  <span>{(a.categories || []).length} categories</span>
                </div>
                <button className="btn btn-primary lp-start-btn">
                  Start Assessment  <Play size={16} style={{ marginRight: 6 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LaunchPad;
