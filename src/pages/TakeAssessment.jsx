import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import '../css/TakeAssessment.css';
import {
  ArrowLeft,
  CheckCircle,
  BarChart3,
  Folder,
  Bookmark,
  Star,
  Check,
  X
} from 'lucide-react';

/* ─── helpers ────────────────────────────────────────────────────────────── */
const ALPHA = ['A', 'B', 'C', 'D', 'E', 'F'];

const flattenQuestions = (categories = []) => {
  const list = [];
  categories.forEach((cat, ci) =>
    (cat.factors || []).forEach((f, fi) =>
      (f.questions || []).forEach((q, qi) =>
        list.push({ ...q, catIdx: ci, factIdx: fi, qIdx: qi, catName: cat.name, factName: f.name })
      )
    )
  );
  return list;
};

/* ─── main component ─────────────────────────────────────────────────────── */
const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // null | response object
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const [visitedCategories, setVisitedCategories] = useState(new Set([0]));
  const bodyRef = useRef(null);

  useEffect(() => {
    api.get(`/assessments/${id}`)
      .then(res => setAssessment(res.data))
      .catch(() => { toast.error('Assessment not found'); navigate('/launchpad'); })
      .finally(() => setLoading(false));
  }, [id]);

  /* ── answer helpers ── */
  const setAnswer = (questionId, val) =>
    setAnswers(prev => ({ ...prev, [questionId]: val }));

  const allQuestions = flattenQuestions(assessment?.categories);

  const totalQuestions = allQuestions.length;

  const answeredInCat = (ci) => {
    const cat = assessment?.categories?.[ci];
    if (!cat) return { answered: 0, total: 0 };
    let total = 0, answered = 0;
    (cat.factors || []).forEach(f =>
      (f.questions || []).forEach(q => {
        total++;
        if (answers[q._id] !== undefined && answers[q._id] !== '') answered++;
      })
    );
    return { answered, total };
  };

  const totalAnswered = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length;
  const progress = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  /* ── switch category ── */
  const switchCategory = (i) => {
    setActiveCategory(i);
    setVisitedCategories(prev => new Set([...prev, i]));
    bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (totalAnswered < totalQuestions) {
      const unanswered = totalQuestions - totalAnswered;
      const go = window.confirm(
        `⚠️  You still have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}.\n\nSubmit anyway?`
      );
      if (!go) return;
    }

    const answersList = [];
    (assessment.categories || []).forEach(cat =>
      (cat.factors || []).forEach(factor =>
        (factor.questions || []).forEach(q => {
          answersList.push({
            questionId: q._id,
            questionText: q.text,
            categoryName: cat.name,
            factorName: factor.name,
            answer: answers[q._id] ?? '',
            questionType: q.type,
          });
        })
      )
    );

    setSubmitting(true);
    try {
      const res = await api.post('/responses', { assessmentId: id, answers: answersList });
      setSubmitResult(res.data);
      toast.success('Assessment submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── loading ── */
  if (loading) return (
    <div className="take-loading">
      <div className="spinner"></div>
      <p>Loading assessment…</p>
    </div>
  );

  /* ── submitted screen ── */
  if (submitResult) return (
    <SubmittedScreen
      assessment={assessment}
      result={submitResult}
      answers={answers}
      onBack={() => navigate('/launchpad')}
      onReports={() => navigate('/reports')}
    />
  );

  const cats = assessment?.categories || [];

  return (
    <div className="take-page">

      {/* ── TOP BAR ── */}
      <div className="take-topbar">
        <div className="take-topbar-left">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/launchpad')}>
           <ArrowLeft size={16} />  Back
          </button>
          <div className="take-topbar-info">
            <h2 className="take-title">{assessment.title}</h2>
            {assessment.description && <p className="take-subtitle">{assessment.description}</p>}
          </div>
        </div>

        <div className="take-topbar-right">
          <div className="take-progress-wrap">
            <div className="take-progress-nums">
              <span className="take-progress-answered">{totalAnswered}</span>
              <span className="take-progress-sep">/</span>
              <span className="take-progress-total">{totalQuestions}</span>
              <span className="take-progress-label">answered</span>
            </div>
            <div className="take-progress-ring-wrap">
              <svg viewBox="0 0 36 36" className="take-progress-ring">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border2)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke="var(--accent)" strokeWidth="3"
                  strokeDasharray={`${progress} ${100 - progress}`}
                  strokeDashoffset="25"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.4s ease' }}
                />
              </svg>
              <span className="take-progress-pct">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="take-cat-tabs-bar">
        {cats.map((cat, i) => {
          const { answered, total } = answeredInCat(i);
          const done = answered === total && total > 0;
          const partial = answered > 0 && !done;
          return (
            <button key={i}
              className={`take-cat-tab ${activeCategory === i ? 'active' : ''} ${done ? 'done' : ''} ${partial ? 'partial' : ''}`}
              onClick={() => switchCategory(i)}>
              <span className="tab-status-dot"></span>
              <span className="tab-cat-name">{cat.name}</span>
              <span className="tab-cat-count">{answered}/{total}</span>
            </button>
          );
        })}
      </div>

      {/* ── BODY ── */}
      <div className="take-body" ref={bodyRef}>
        {cats.map((cat, ci) => (
          <div key={ci} className={`take-cat-section ${ci !== activeCategory ? 'hidden-cat' : ''}`}>

            {/* category banner */}
            <div className="take-cat-banner">
              <div className="take-cat-banner-left">
                <span className="take-cat-icon"><Folder size={18} /></span>
                <div>
                  <h3 className="take-cat-title">{cat.name}</h3>
                  {cat.description && <p className="take-cat-desc">{cat.description}</p>}
                </div>
              </div>
              <div className="take-cat-banner-right">
                {(() => { const { answered, total } = answeredInCat(ci); return (
                  <div className="cat-mini-progress">
                    <div className="cat-mini-bar">
                      <div className="cat-mini-fill" style={{ width: `${total ? (answered/total)*100 : 0}%` }}></div>
                    </div>
                    <span>{answered}/{total}</span>
                  </div>
                ); })()}
              </div>
            </div>

            {/* factors */}
            {(cat.factors || []).map((factor, fi) => (
              <div key={fi} className="take-factor-block">
                <div className="take-factor-header">
                  <span className="take-factor-pill">  <Bookmark size={14} /> {factor.name}</span>
                  {factor.description && <span className="take-factor-desc">{factor.description}</span>}
                  <span className="take-factor-qcount">{factor.questions?.length || 0} questions</span>
                </div>

                <div className="take-questions-grid">
                  {(factor.questions || []).map((q, qi) => {
                    const answered = answers[q._id] !== undefined && answers[q._id] !== '';
                    /* global question number */
                    const globalNum = allQuestions.findIndex(x => x._id === q._id) + 1;
                    return (
                      <div key={q._id} className={`take-q-card ${answered ? 'q-answered' : 'q-unanswered'}`}>
                        <div className="take-q-top">
                          <div className="take-q-badge-row">
                            <span className="take-q-num">Q{globalNum}</span>
                            <span className={`take-q-type-chip qtype-${q.type}`}>
                              {q.type === 'multiple_choice' ? 'MCQ'
                                : q.type === 'yes_no' ? 'Yes/No'
                                : q.type === 'rating' ? 'Rating'
                                : q.type === 'scale' ? 'Scale'
                                : 'Text'}
                            </span>
                            {answered && <span className="q-done-tick"><Check size={14} />  Answered</span>}
                          </div>
                          <p className="take-q-text">{q.text}</p>
                        </div>
                        <div className="take-q-input-area">
                          <QuestionInput
                            question={q}
                            value={answers[q._id]}
                            onChange={val => setAnswer(q._id, val)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div className="take-footer">
        <div className="take-footer-nav">
          {activeCategory > 0 && (
            <button className="btn btn-secondary" onClick={() => switchCategory(activeCategory - 1)}>
              ← {cats[activeCategory - 1]?.name}
            </button>
          )}
          {activeCategory < cats.length - 1 && (
            <button className="btn btn-primary" onClick={() => switchCategory(activeCategory + 1)}>
              {cats[activeCategory + 1]?.name} →
            </button>
          )}
        </div>

        <div className="take-footer-right">
          <div className="footer-progress-bar">
            <div className="footer-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <button className="btn btn-success btn-lg take-submit-btn"
            onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? <><span className="btn-spinner"></span> Submitting…</>
              : <><span> <CheckCircle size={18} /></span> Submit Assessment</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Submitted / Result Screen ──────────────────────────────────────────── */
const SubmittedScreen = ({ assessment, result, answers, onBack, onReports }) => {
  const total = flattenQuestions(assessment?.categories).length;
  const answered = result.answers?.length || 0;

  return (
    <div className="submitted-page">
      <div className="submitted-hero">
        <div className="submitted-confetti">🎉</div>
        <h1 className="submitted-heading">Assessment Submitted!</h1>
        <p className="submitted-sub">
          You've completed <strong>{assessment.title}</strong>. Your responses have been recorded.
        </p>

        <div className="submitted-stats-row">
          <div className="submitted-stat">
            <div className="submitted-stat-val">{answered}</div>
            <div className="submitted-stat-label">Questions Answered</div>
          </div>
          <div className="submitted-stat">
            <div className="submitted-stat-val">{total - answered}</div>
            <div className="submitted-stat-label">Skipped</div>
          </div>
          <div className="submitted-stat">
            <div className="submitted-stat-val">{(assessment.categories || []).length}</div>
            <div className="submitted-stat-label">Categories</div>
          </div>
          <div className="submitted-stat">
            <div className="submitted-stat-val">
              {new Date(result.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="submitted-stat-label">Submitted At</div>
          </div>
        </div>

        <div className="submitted-actions">
          <button className="btn btn-secondary btn-lg" onClick={onBack}>← Back to Launch Pad</button>
          <button className="btn btn-primary btn-lg" onClick={onReports}>📊 View in Reports</button>
        </div>
      </div>

      {/* Response summary */}
      <div className="submitted-summary">
        <h2 className="summary-heading">Your Response Summary</h2>
        {(assessment.categories || []).map((cat, ci) => (
          <div key={ci} className="summary-category">
            <div className="summary-cat-label">📁 {cat.name}</div>
            {(cat.factors || []).map((f, fi) => (
              <div key={fi} className="summary-factor">
                <div className="summary-factor-label">🔖 {f.name}</div>
                <div className="summary-questions">
                  {(f.questions || []).map((q, qi) => {
                    const ans = answers[q._id];
                    const hasAnswer = ans !== undefined && ans !== '';
                    const globalNum = flattenQuestions(assessment.categories).findIndex(x => x._id === q._id) + 1;
                    return (
                      <div key={q._id} className={`summary-q-row ${hasAnswer ? 'sq-answered' : 'sq-skipped'}`}>
                        <div className="summary-q-left">
                          <span className="summary-q-num">Q{globalNum}</span>
                          <span className={`take-q-type-chip qtype-${q.type}`}>
                            {q.type === 'multiple_choice' ? 'MCQ' : q.type === 'yes_no' ? 'Yes/No'
                              : q.type === 'rating' ? 'Rating' : q.type === 'scale' ? 'Scale' : 'Text'}
                          </span>
                          <span className="summary-q-text">{q.text}</span>
                        </div>
                        <div className="summary-q-right">
                          {hasAnswer
                            ? <span className="summary-answer-val">{String(ans)}</span>
                            : <span className="summary-skipped-label">— Skipped</span>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Question Input Components ──────────────────────────────────────────── */
const QuestionInput = ({ question, value, onChange }) => {
  switch (question.type) {

    case 'multiple_choice':
      return (
        <div className="mc-options">
          {(question.options || []).map((opt, i) => (
            <button key={i}
              className={`mc-opt-btn ${value === opt ? 'mc-selected' : ''}`}
              onClick={() => onChange(opt)}>
              <span className="mc-opt-letter">{ALPHA[i]}</span>
              <span className="mc-opt-text">{opt || `Option ${i + 1}`}</span>
              {value === opt && <span className="mc-opt-check">✓</span>}
            </button>
          ))}
        </div>
      );

    case 'yes_no':
      return (
        <div className="yn-wrap">
          {[
            { val: 'Yes', icon: '✓', cls: 'yn-yes' },
            { val: 'No',  icon: '✕', cls: 'yn-no'  },
          ].map(({ val, icon, cls }) => (
            <button key={val}
              className={`yn-btn ${cls} ${value === val ? 'yn-selected' : ''}`}
              onClick={() => onChange(val)}>
              <span className="yn-icon">{icon}</span>
              <span>{val}</span>
            </button>
          ))}
        </div>
      );

    case 'rating':
      return (
        <div className="rating-wrap">
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n}
                className={`star-btn ${(value || 0) >= n ? 'star-filled' : ''}`}
                onClick={() => onChange(n)}>
                ★
              </button>
            ))}
          </div>
          <div className="rating-labels-row">
            <span>Poor</span>
            <span className="rating-chosen">{value ? `${value} / 5` : 'Not rated'}</span>
            <span>Excellent</span>
          </div>
        </div>
      );

    case 'scale':
      const pct = value ? ((value - 1) / 9) * 100 : 0;
      return (
        <div className="scale-wrap">
          <div className="scale-track-wrap">
            <input type="range" min={1} max={10}
              value={value || 5}
              onChange={e => onChange(Number(e.target.value))}
              className="scale-slider" />
            <div className="scale-ticks">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <span key={n} className={`scale-tick ${value === n ? 'tick-active' : ''}`}>{n}</span>
              ))}
            </div>
          </div>
          <div className="scale-value-display">
            <span>Selected:</span>
            <strong className="scale-val-num">{value || '—'}</strong>
            <span>/ 10</span>
          </div>
        </div>
      );

    case 'text':
    default:
      return (
        <div className="text-wrap">
          <textarea
            className="form-control text-answer"
            placeholder="Type your answer here…"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            rows={4}
          />
          <div className="text-char-count">{(value || '').length} characters</div>
        </div>
      );
  }
};

export default TakeAssessment;
