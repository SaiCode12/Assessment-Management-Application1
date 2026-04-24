import React, { useState,useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import SettingsModal from '../components/SettingsModal';
import LoadCategoriesModal from '../components/LoadCategoriesModal';
import '../css/Builder.css';
import {
  FolderOpen,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Folder,
  Tag,
  FileText,
  Star,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'rating',          label: 'Rating (1–5)'    },
  { value: 'scale',           label: 'Scale (1–10)'    },
  { value: 'text',            label: 'Free Text'       },
  { value: 'yes_no',          label: 'Yes / No'        },
];

const ALPHA = ['A','B','C','D','E','F'];
const makeId = () => Math.random().toString(36).substr(2, 9);

const defaultQuestion = (type = 'text') => ({
  _id: makeId(), text: '', type,
  options: type === 'multiple_choice' ? ['', ''] : [],
  correctAnswer: undefined,
  marks: 1,
  required: true,
});

const defaultFactor   = () => ({ _id: makeId(), name: '', description: '', questions: [] });
const defaultCategory = () => ({ _id: makeId(), name: '', description: '', factors: [], open: true });

/* ─── helpers ─────────────────────────────────────────────────────────── */
const updateIn = (arr, idx, fn) => arr.map((item, i) => i === idx ? fn(item) : item);

/* ═══════════════════════════════════════════════════════════════════════ */
const Builder = () => {
  const navigate = useNavigate();
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [passPercent,  setPassPercent]  = useState(60);
  const [categories,   setCategories]   = useState([defaultCategory()]);
  const [settingsModal,setSettingsModal]= useState({ open: false, catIdx: null, factIdx: null });
  const [loadModal,    setLoadModal]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const location = useLocation();
const params = new URLSearchParams(location.search);
const editId = params.get('edit');

  /* ── category ── */
  const addCategory    = () => setCategories(c => [...c, defaultCategory()]);
  const removeCategory = ci => setCategories(c => c.filter((_, i) => i !== ci));
  const toggleCategory = ci => setCategories(c => updateIn(c, ci, cat => ({ ...cat, open: !cat.open })));
  const updateCategory = (ci, field, val) =>
    setCategories(c => updateIn(c, ci, cat => ({ ...cat, [field]: val })));

  /* ── factor ── */
  const addFactor    = ci =>
    setCategories(c => updateIn(c, ci, cat => ({
      ...cat, factors: [...cat.factors, { ...defaultFactor(), open: true }]
    })));
  const removeFactor = (ci, fi) =>
    setCategories(c => updateIn(c, ci, cat => ({
      ...cat, factors: cat.factors.filter((_, j) => j !== fi)
    })));
  const toggleFactor = (ci, fi) =>
    setCategories(c => updateIn(c, ci, cat => ({
      ...cat, factors: updateIn(cat.factors, fi, f => ({ ...f, open: !f.open }))
    })));
  const updateFactor = (ci, fi, field, val) =>
    setCategories(c => updateIn(c, ci, cat => ({
      ...cat, factors: updateIn(cat.factors, fi, f => ({ ...f, [field]: val }))
    })));

  /* ── questions from settings popup ── */
  const openSettings = (ci, fi) => setSettingsModal({ open: true, catIdx: ci, factIdx: fi });
  const addQuestionsFromSettings = (ci, fi, config) => {
    const newQs = config.flatMap(({ type, count }) =>
      Array.from({ length: count }, () => defaultQuestion(type))
    );
    setCategories(c => updateIn(c, ci, cat => ({
      ...cat,
      factors: updateIn(cat.factors, fi, f => ({
        ...f, questions: [...f.questions, ...newQs]
      }))
    })));
    setSettingsModal({ open: false, catIdx: null, factIdx: null });
  };

  /* ── question field update ── */
  const updateQuestion = (ci, fi, qi, field, val) =>
    setCategories(c => updateIn(c, ci, cat => ({
      ...cat,
      factors: updateIn(cat.factors, fi, f => ({
        ...f, questions: updateIn(f.questions, qi, q => ({ ...q, [field]: val }))
      }))
    })));

  const removeQuestion = (ci, fi, qi) =>
    setCategories(c => updateIn(c, ci, cat => ({
      ...cat,
      factors: updateIn(cat.factors, fi, f => ({
        ...f, questions: f.questions.filter((_, k) => k !== qi)
      }))
    })));

  /* ── option helpers ── */
  const updateOption = (ci, fi, qi, oi, val) =>
    setCategories(c => updateIn(c, ci, cat => ({
      ...cat,
      factors: updateIn(cat.factors, fi, f => ({
        ...f,
        questions: updateIn(f.questions, qi, q => ({
          ...q, options: q.options.map((o, l) => l === oi ? val : o)
        }))
      }))
    })));

  const addOption = (ci, fi, qi) =>
    setCategories(c => updateIn(c, ci, cat => ({
      ...cat,
      factors: updateIn(cat.factors, fi, f => ({
        ...f,
        questions: updateIn(f.questions, qi, q => ({
          ...q, options: [...q.options, '']
        }))
      }))
    })));

  const removeOption = (ci, fi, qi, oi) =>
    setCategories(c => updateIn(c, ci, cat => ({
      ...cat,
      factors: updateIn(cat.factors, fi, f => ({
        ...f,
        questions: updateIn(f.questions, qi, q => ({
          ...q,
          options: q.options.filter((_, l) => l !== oi),
          correctAnswer: q.correctAnswer === q.options[oi] ? undefined : q.correctAnswer
        }))
      }))
    })));

  /* ── load categories ── */
  const handleLoadCategories = (selected) => {
    const mapped = selected.map(cat => ({
      ...cat, _id: makeId(), open: true,
      factors: cat.factors.map(f => ({
        ...f, _id: makeId(), open: true,
        questions: f.questions.map(q => ({ ...q, _id: makeId() }))
      }))
    }));
    setCategories(prev => [...prev, ...mapped]);
    setLoadModal(false);
    toast.success(`${mapped.length} category(ies) loaded`);
  };

  /* ── save ── */
  const handleSave = async () => {
    if (!title.trim()) { toast.error('Please enter an assessment title'); return; }
    const valid = categories.every(cat =>
      cat.name.trim() &&
      cat.factors.every(f =>
        f.name.trim() &&
        f.questions.every(q => q.text.trim())
      )
    );
    if (!valid) { toast.error('Fill in all category, factor and question names'); return; }

    setSaving(true);
    try {
      const payload = {
        title, description, passPercent,
        categories: categories.map(({ _id, open, ...cat }) => ({
          ...cat,
          factors: cat.factors.map(({ _id: fid, open: fo, ...f }) => ({
            ...f,
            questions: f.questions.map(({ _id: qid, ...q }) => q)
          }))
        }))
      };
      if (editId) {
  await api.put(`/assessments/${editId}`, payload);
  toast.success('Assessment updated!');
} else {
  await api.post('/assessments/create', payload);
  toast.success('Assessment saved!');
}
      setTitle(''); setDescription(''); setPassPercent(60);
      setCategories([defaultCategory()]);
      navigate('/assessments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };
  const fetchAssessmentById = async (id) => {
  try {
    const res = await api.get(`/assessments/${id}`);
    const data = res.data;

    setTitle(data.title || '');
    setDescription(data.description || '');
    setPassPercent(data.passPercent || 60);

    const mappedCategories = (data.categories || []).map(cat => ({
      ...cat,
      _id: makeId(),
      open: true,
      factors: (cat.factors || []).map(f => ({
        ...f,
        _id: makeId(),
        open: true,
        questions: (f.questions || []).map(q => ({
          ...q,
          _id: makeId(),
        }))
      }))
    }));

    setCategories(mappedCategories.length ? mappedCategories : [defaultCategory()]);

  } catch (err) {
    toast.error('Failed to load assessment');
  }
};

useEffect(() => {
  if (editId) {
    fetchAssessmentById(editId);
  }
}, [editId]);

  /* ── total marks summary ── */
  const totalMarks = categories.reduce((s, cat) =>
    s + cat.factors.reduce((fs, f) =>
      fs + f.questions.reduce((qs, q) => qs + (Number(q.marks) || 1), 0), 0), 0);

  const totalQuestions = categories.reduce((s, cat) =>
    s + cat.factors.reduce((fs, f) => fs + f.questions.length, 0), 0);

  /* ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="builder-page">

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Assessment Builder</h1>
          <p className="page-subtitle">Build structured assessments with correct answers and scoring</p>
        </div>
        <div className="builder-actions">
          <button className="btn btn-secondary" onClick={() => setLoadModal(true)}>
            <FolderOpen size={16} />
            Load Categories
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="btn-spinner"></span> : <Save size={16} />}
            Save Assessment
          </button>
        </div>
      </div>

      {/* ── ASSESSMENT META ── */}
      <div className="card builder-meta">
        <div className="builder-meta-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assessment Title *</label>
            <input className="form-control" placeholder="e.g. Coding Skills Assessment Q4"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description</label>
            <input className="form-control" placeholder="Brief description of this assessment"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pass Percentage (%)</label>
            <input className="form-control" type="number" min={0} max={100}
              placeholder="e.g. 60"
              value={passPercent} onChange={e => setPassPercent(Number(e.target.value))} />
          </div>
        </div>

        {/* summary bar */}
        {totalQuestions > 0 && (
          <div className="builder-summary-bar">
       <div className="summary-pill">
  <FileText size={16} />
  <span>{totalQuestions} Questions</span>
</div>

<div className="summary-pill">
  <Star size={16} />
  <span>{totalMarks} Total Marks</span>
</div>

<div className="summary-pill">
  <Target size={16} />
  <span>Pass at {passPercent}% ({Math.ceil(totalMarks * passPercent / 100)} marks)</span>
</div>
          </div>
        )}
      </div>

      {/* ── CATEGORIES ── */}
      <div className="categories-list">
        {categories.map((cat, ci) => (
          <div key={cat._id} className="category-block">

            {/* category row */}
            <div className="category-header" onClick={() => toggleCategory(ci)}>
              <div className="accordion-arrow">
  {cat.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
</div>
             <Folder size={16} className="category-icon" />
              <div className="category-title-area">
                {cat.open
                  ? <input className="inline-input" placeholder="Category name *"
                      value={cat.name}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateCategory(ci, 'name', e.target.value)} />
                  : <span className="accordion-label">{cat.name || 'Unnamed Category'}</span>
                }
              </div>
              <span className="accordion-meta">{cat.factors.length} factor(s)</span>
              <button className="btn btn-danger btn-sm btn-icon"
                onClick={e => { e.stopPropagation(); removeCategory(ci); }}> <Trash2 size={14} /></button>
            </div>

            {cat.open && (
              <div className="category-body">
                <div className="form-group">
                  <label className="form-label">Category Description</label>
                  <input className="form-control" placeholder="Optional description"
                    value={cat.description}
                    onChange={e => updateCategory(ci, 'description', e.target.value)} />
                </div>

                {/* ── FACTORS ── */}
                <div className="factors-list">
                  {cat.factors.map((factor, fi) => (
                    <div key={factor._id} className="factor-block">

                      <div className="factor-header" onClick={() => toggleFactor(ci, fi)}>
                        <div className="accordion-arrow">{factor.open ?<ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
                        <Tag size={16} className="factor-icon" />
                        <div className="factor-title-area">
                          {factor.open
                            ? <input className="inline-input" placeholder="Factor name *"
                                value={factor.name}
                                onClick={e => e.stopPropagation()}
                                onChange={e => updateFactor(ci, fi, 'name', e.target.value)} />
                            : <span className="accordion-label">{factor.name || 'Unnamed Factor'}</span>
                          }
                        </div>
                        <span className="accordion-meta">{factor.questions.length} Q</span>
                        <button className="btn btn-teal btn-sm"
                          onClick={e => { e.stopPropagation(); openSettings(ci, fi); }}>
                          <Plus size={14} /> Questions
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon"
                          onClick={e => { e.stopPropagation(); removeFactor(ci, fi); }}> <Trash2 size={14} /></button>
                      </div>

                      {factor.open && (
                        <div className="factor-body">
                          <div className="form-group">
                            <label className="form-label">Factor Description</label>
                            <input className="form-control" placeholder="Optional description"
                              value={factor.description}
                              onChange={e => updateFactor(ci, fi, 'description', e.target.value)} />
                          </div>

                          {factor.questions.length === 0 && (
                            <div className="no-questions">
                              <p>No questions yet — click <strong><Plus size={14} /> Questions</strong> above to add some.</p>
                            </div>
                          )}

                          {/* ── QUESTIONS ── */}
                          <div className="questions-list">
                            {factor.questions.map((q, qi) => (
                              <QuestionCard key={q._id}
                                q={q} qi={qi}
                                ci={ci} fi={fi}
                                updateQuestion={updateQuestion}
                                updateOption={updateOption}
                                addOption={addOption}
                                removeOption={removeOption}
                                removeQuestion={removeQuestion}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className="btn btn-secondary btn-sm add-factor-btn"
                  onClick={() => addFactor(ci)}>
                 <Plus size={14} /> Add Factor
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="btn btn-secondary add-category-btn" onClick={addCategory}>
       <Plus size={14} /> Add Category
      </button>

      {settingsModal.open && (
        <SettingsModal
          onClose={() => setSettingsModal({ open: false, catIdx: null, factIdx: null })}
          onConfirm={(config) => addQuestionsFromSettings(settingsModal.catIdx, settingsModal.factIdx, config)}
          questionTypes={QUESTION_TYPES}
        />
      )}

      {loadModal && (
        <LoadCategoriesModal
          onClose={() => setLoadModal(false)}
          onLoad={handleLoadCategories}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════ */
/* QuestionCard — renders question + correct answer configurator          */
/* ═══════════════════════════════════════════════════════════════════════ */


const QuestionCard = ({
  q, qi, ci, fi,
  updateQuestion, updateOption, addOption, removeOption, removeQuestion
}) => {
  const typeLabels = {
    multiple_choice: 'Multiple Choice',
    rating: 'Rating (1–5)',
    scale: 'Scale (1–10)',
    text: 'Free Text',
    yes_no: 'Yes / No',
  };

  return (
    <div className={`question-card ${q.correctAnswer !== undefined && q.correctAnswer !== '' ? 'qc-has-answer' : ''}`}>

      {/* ── top row: type badge + marks + remove ── */}
      <div className="question-header">
        <span className={`qtype-badge qtype-${q.type}`}>
          {typeLabels[q.type] || q.type}
        </span>
        <div className="qc-marks-wrap">
          <label className="qc-marks-label">Marks</label>
          <input className="qc-marks-input" type="number" min={0} max={100}
            value={q.marks ?? 1}
            onChange={e => updateQuestion(ci, fi, qi, 'marks', Number(e.target.value))} />
        </div>
        <button className="btn btn-danger btn-sm btn-icon"
          onClick={() => removeQuestion(ci, fi, qi)}>  <Trash2 size={14} /></button>
      </div>

      {/* ── question text ── */}
      <div className="form-group qc-text-group">
        <input className="form-control" placeholder="Question text *"
          value={q.text}
          onChange={e => updateQuestion(ci, fi, qi, 'text', e.target.value)} />
      </div>

      {/* ── type-specific: options + correct answer ── */}
      {q.type === 'multiple_choice' && (
        <div className="qc-section">
          <label className="form-label">Options &amp; Correct Answer</label>
          <p className="qc-hint">Fill options then click the circle to mark the correct one</p>
          <div className="mc-builder-options">
            {q.options.map((opt, oi) => {
              const isCorrect = q.correctAnswer === opt;
              return (
                <div key={oi} className={`mc-builder-row ${isCorrect ? 'mc-correct-row' : ''}`}>
                  <button
                    className={`mc-correct-btn ${isCorrect ? 'mc-correct-active' : ''}`}
                    title="Mark as correct answer"
                    onClick={() => updateQuestion(ci, fi, qi, 'correctAnswer', isCorrect ? undefined : opt)}>
                    {isCorrect ? '✓' : '○'}
                  </button>
                  <span className="mc-letter">{ALPHA[oi]}</span>
                  <input className="form-control" placeholder={`Option ${ALPHA[oi]}`}
                    value={opt}
                    onChange={e => {
                      if (isCorrect) updateQuestion(ci, fi, qi, 'correctAnswer', e.target.value);
                      updateOption(ci, fi, qi, oi, e.target.value);
                    }} />
                  <button className="btn btn-danger btn-sm btn-icon"
                    onClick={() => removeOption(ci, fi, qi, oi)}
                    disabled={q.options.length <= 2}>  <Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}
            onClick={() => addOption(ci, fi, qi)}>  <Plus size={14} /> Add Option</button>

          {q.correctAnswer && (
            <div className="qc-correct-preview">
              <span className="qc-correct-icon"> <CheckCircle size={16} /></span>
              <span>Correct answer: <strong>{q.correctAnswer}</strong></span>
            </div>
          )}
        </div>
      )}

      {q.type === 'yes_no' && (
        <div className="qc-section">
          <label className="form-label">Correct Answer</label>
          <div className="yn-builder-row">
            {['Yes', 'No'].map(val => (
              <button key={val}
                className={`yn-builder-btn ${q.correctAnswer === val ? 'yn-builder-selected' : ''} ${val === 'Yes' ? 'yn-yes-btn' : 'yn-no-btn'}`}
                onClick={() => updateQuestion(ci, fi, qi, 'correctAnswer',
                  q.correctAnswer === val ? undefined : val)}>
                {val === 'Yes' ? '✓ Yes' : '✕ No'}
              </button>
            ))}
            {q.correctAnswer && (
              <span className="qc-correct-preview" style={{ marginLeft: 'auto' }}>
                <span className="qc-correct-icon"> <CheckCircle size={16} /></span>
                Correct: <strong>{q.correctAnswer}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {q.type === 'rating' && (
        <div className="qc-section">
          <label className="form-label">Expected Rating (1–5)</label>
          <p className="qc-hint">Click a star to set the correct / expected rating</p>
          <div className="rating-builder-row">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n}
                className={`star-builder-btn ${(q.correctAnswer || 0) >= n ? 'star-filled' : ''}`}
                onClick={() => updateQuestion(ci, fi, qi, 'correctAnswer',
                  q.correctAnswer === n ? undefined : n)}>
                ★
              </button>
            ))}
            {q.correctAnswer && (
              <span className="qc-correct-preview">
                <span className="qc-correct-icon">✓</span>
                Expected: <strong>{q.correctAnswer}/5</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {q.type === 'scale' && (
        <div className="qc-section">
          <label className="form-label">Expected Scale Value (1–10)</label>
          <p className="qc-hint">Set the expected value. Answers within ±1 will be marked correct.</p>
          <div className="scale-builder-row">
            <input type="range" min={1} max={10}
              value={q.correctAnswer || 5}
              onChange={e => updateQuestion(ci, fi, qi, 'correctAnswer', Number(e.target.value))}
              className="scale-builder-slider" />
            <div className="scale-builder-ticks">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <span key={n} className={`scale-builder-tick ${q.correctAnswer === n ? 'tick-active' : ''}`}>{n}</span>
              ))}
            </div>
            {q.correctAnswer && (
              <div className="qc-correct-preview">
                <span className="qc-correct-icon">✓</span>
                Expected: <strong>{q.correctAnswer}</strong>
                <span style={{ color: 'var(--text3)', marginLeft: 4 }}>(±1 accepted)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {q.type === 'text' && (
        <div className="qc-section qc-text-notice">
          <span className="qc-notice-icon">  <AlertTriangle size={14} /></span>
          <span>Free text questions are <strong>not auto-evaluated</strong> — they will be flagged for manual review in Reports.</span>
        </div>
      )}

      {/* ── no correct answer warning ── */}
      {q.type !== 'text' && (q.correctAnswer === undefined || q.correctAnswer === '') && (
        <div className="qc-no-answer-warn">
           <AlertTriangle size={14} /> No correct answer set — this question won't be scored
        </div>
      )}
    </div>
  );
};

export default Builder;
