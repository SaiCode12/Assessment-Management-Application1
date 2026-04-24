import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Rocket, BarChart2, Pencil, Trash2, ClipboardList, Folder, HelpCircle } from 'lucide-react';
import api from '../utils/api';
import ConfirmModal from '../components/ConfirmModel';
import '../css/Assessments.css';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deleting,    setDeleting]    = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const navigate = useNavigate();

  const fetchAssessments = async () => {
    try {
      const res = await api.get('/assessments');
      setAssessments(res.data);
    } catch {
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssessments(); }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    setDeleting(id);
    try {
      await api.delete(`/assessments/${id}`);
      toast.success('Assessment deleted');
      setAssessments(prev => prev.filter(x => x._id !== id));
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const countQuestions = (a) =>
    (a.categories || []).reduce((t, cat) =>
      t + (cat.factors || []).reduce((ft, f) => ft + (f.questions || []).length, 0), 0);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding: 60 }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="assessments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assessments</h1>
          <p className="page-subtitle">Manage and view all your saved assessments</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/builder')}>
          <Plus size={16}/> New Assessment
        </button>
      </div>

      {assessments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><ClipboardList size={48} strokeWidth={1.2} color="var(--accent2)"/></div>
          <div className="empty-title">No assessments yet</div>
          <div className="empty-text">Create your first assessment in the Builder</div>
          <button className="btn btn-primary" onClick={() => navigate('/builder')}>Go to Builder</button>
        </div>
      ) : (
        <div className="assessments-grid">
          {assessments.map(a => (
            <div key={a._id} className="assessment-card">
              <div className="assessment-card-header">
                <div className="assessment-title">{a.title}</div>
                <div className="assessment-date">
                  {new Date(a.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                </div>
              </div>

              {a.description && <p className="assessment-desc">{a.description}</p>}

              <div className="assessment-stats">
                <div className="stat-pill">
                  <Folder size={12}/>
                  <span>{(a.categories||[]).length} Categories</span>
                </div>
                <div className="stat-pill">
                  <HelpCircle size={12}/>
                  <span>{countQuestions(a)} Questions</span>
                </div>
              </div>

              <div className="assessment-actions">
                <button className="btn btn-teal btn-sm" onClick={() => navigate(`/launchpad/${a._id}`)}>
                  <Rocket size={13}/> Take
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/reports?assessment=${a._id}`)}>
                  <BarChart2 size={13}/> Reports
                </button>
                <button className="btn btn-secondary btn-sm edit-btn"
                  onClick={() => navigate(`/builder?edit=${a._id}`)} title="Edit assessment">
                  <Pencil size={13}/>
                </button>
                <button className="btn btn-danger btn-sm"
                  onClick={() => setDeleteTarget({ id: a._id, title: a.title })}
                  disabled={deleting === a._id} title="Delete assessment">
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Assessment"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        icon={<Trash2 size={36} color="var(--red)"/>}
        confirmLabel="Delete"
        confirmClass="btn-danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Assessments;