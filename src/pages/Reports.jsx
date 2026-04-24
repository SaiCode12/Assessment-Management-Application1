import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import '../css/Reports.css';

import {
  BarChart3,
  Search,
  X,
  Folder,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Minus,
  Star,
} from 'lucide-react';

/* ─── helpers ────────────────────────────────────────────────────────── */
const fmt = d => new Date(d).toLocaleString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
});
const fmtShort = d => new Date(d).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric'
});
const typeLabel = t =>
  t === 'multiple_choice' ? 'MCQ'
  : t === 'yes_no' ? 'Yes/No'
  : t === 'rating' ? 'Rating'
  : t === 'scale' ? 'Scale'
  : 'Text';

const ScoreBadge = ({ percentage, passed }) => {
  if (passed === null || passed === undefined) return null;
  return (
    <span className={`score-badge ${passed ? 'badge-pass' : 'badge-fail'}`}>
     {passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
{passed ? ' PASSED' : ' FAILED'}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════ */
const Reports = () => {
  const [responses,       setResponses]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selected,        setSelected]        = useState(null);
  const [search,          setSearch]          = useState('');
  const [filterAssessment,setFilterAssessment]= useState('all');
  const [searchParams]  = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/responses')
      .then(res => {
        setResponses(res.data);
        const aId = searchParams.get('assessment');
        if (aId) {
          const match = res.data.find(r =>
            (r.assessmentId?._id || r.assessmentId) === aId
          );
          if (match) { setSelected(match); setFilterAssessment(match.assessmentTitle || 'all'); }
        }
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const assessmentTitles = [...new Set(responses.map(r => r.assessmentTitle).filter(Boolean))];

  const filtered = responses.filter(r => {
    const s = search.toLowerCase();
    const matchSearch =
      (r.assessmentTitle     || '').toLowerCase().includes(s) ||
      (r.submittedBy?.name   || '').toLowerCase().includes(s) ||
      (r.submittedBy?.email  || '').toLowerCase().includes(s);
    const matchFilter = filterAssessment === 'all' || r.assessmentTitle === filterAssessment;
    return matchSearch && matchFilter;
  });

  const grouped = {};
  filtered.forEach(r => {
    const key = r.assessmentTitle || 'Unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const buildCatMap = (response) => {
    const map = {};
    (response.answers || []).forEach(a => {
      const cat    = a.categoryName || 'Uncategorized';
      const factor = a.factorName   || 'General';
      if (!map[cat]) map[cat] = {};
      if (!map[cat][factor]) map[cat][factor] = [];
      map[cat][factor].push(a);
    });
    return map;
  };

  const totalResponses   = responses.length;
  const totalAssessments = assessmentTitles.length;
  const avgPercent       = responses.length
    ? Math.round(responses.reduce((s, r) => s + (r.percentage || 0), 0) / responses.length)
    : 0;
  const passCount = responses.filter(r => r.passed === true).length;

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding: 60 }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="reports-page">

      {/* ── HEADER ── */}
      <div className="reports-header">
        <div>
          <h1 className="page-title"> <BarChart3 size={22} /> Reports</h1>
          <p className="page-subtitle">Structured view of all submitted assessment responses with scores</p>
        </div>
        <div className="reports-kpi-row">
          <div className="kpi-card">
            <div className="kpi-val">{totalResponses}</div>
            <div className="kpi-label">Responses</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val">{totalAssessments}</div>
            <div className="kpi-label">Assessments</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val kpi-pass">{passCount}</div>
            <div className="kpi-label">Passed</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-val">{avgPercent}%</div>
            <div className="kpi-label">Avg Score</div>
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="reports-filters">
        <div className="reports-search-wrap">
         <Search size={16} className="search-icon-r" />
          <input className="form-control reports-search"
            placeholder="Search by name, email or assessment…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control reports-filter-select"
          value={filterAssessment}
          onChange={e => setFilterAssessment(e.target.value)}>
          <option value="all">All Assessments</option>
          {assessmentTitles.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {selected && (
          <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>
           <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* ── LAYOUT ── */}
      <div className="reports-layout">

        {/* LEFT list */}
        <div className="reports-list-panel">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon"> <Folder size={40} /></div>
              <div className="empty-title">No responses found</div>
              <div className="empty-text">
                {search || filterAssessment !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Complete assessments in the Launch Pad first'}
              </div>
              {!search && filterAssessment === 'all' && (
                <button className="btn btn-primary" style={{ marginTop: 12 }}
                  onClick={() => navigate('/launchpad')}>
                  Go to Launch Pad
                </button>
              )}
            </div>
          ) : (
            Object.entries(grouped).map(([title, resps]) => (
              <div key={title} className="rlist-group">
                <div className="rlist-group-header">
                  <span className="rlist-group-title">{title}</span>
                  <span className="rlist-group-count">{resps.length} submission{resps.length !== 1 ? 's' : ''}</span>
                </div>

                {resps.map(r => {
                  const isActive  = selected?._id === r._id;
                  const hasScore  = r.maxScore > 0;
                  return (
                    <div key={r._id}
                      className={`rlist-item ${isActive ? 'rlist-item-active' : ''}`}
                      onClick={() => setSelected(r)}>

                      <div className="rlist-item-left">
                        <div className={`rlist-avatar ${r.passed === true ? 'avatar-pass' : r.passed === false ? 'avatar-fail' : ''}`}>
                          {r.submittedBy?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="rlist-user-info">
                          <div className="rlist-name">{r.submittedBy?.name || 'Unknown'}</div>
                          <div className="rlist-email">{r.submittedBy?.email}</div>
                          <div className="rlist-date">{fmtShort(r.submittedAt)}</div>
                        </div>
                      </div>

                      <div className="rlist-item-right">
                        {hasScore ? (
                          <div className="rlist-score-wrap">
                            <div className={`rlist-pct ${r.passed === true ? 'pct-pass' : r.passed === false ? 'pct-fail' : ''}`}>
                              {r.percentage}%
                            </div>
                            <div className="rlist-score-sub">{r.totalScore}/{r.maxScore}</div>
                          </div>
                        ) : (
                          <div className="rlist-score-wrap">
                            <div className="rlist-pct pct-neutral">{r.answers?.length || 0}</div>
                            <div className="rlist-score-sub">ans</div>
                          </div>
                        )}
                        {isActive && <span className="rlist-active-dot">●</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* RIGHT detail */}
        <div className="reports-detail-panel">
          {!selected ? (
            <div className="detail-placeholder">
              <div className="detail-placeholder-icon">👈</div>
              <h3>Select a submission</h3>
              <p>Click any response on the left to view its detailed answers and scores.</p>
            </div>
          ) : (
            <ResponseDetail response={selected} buildCatMap={buildCatMap} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════ */
const ResponseDetail = ({ response, buildCatMap }) => {
  const catMap   = buildCatMap(response);
  const catNames = Object.keys(catMap);
  const [activeTab, setActiveTab] = useState(catNames[0] || '');

  const hasScore    = response.maxScore > 0;
  const totalAnswers= response.answers?.length || 0;
  const skipped     = (response.answers || []).filter(a => !a.answer && a.answer !== 0).length;
  const correct     = (response.answers || []).filter(a => a.isCorrect === true).length;
  const wrong       = (response.answers || []).filter(a => a.isCorrect === false).length;
  const manual      = (response.answers || []).filter(a => a.isCorrect === null).length;

  return (
    <div className="detail-wrap">

      {/* ── top bar ── */}
      <div className="detail-topbar">
        <div className="detail-topbar-left">
          <div className={`detail-avatar-lg ${response.passed === true ? 'avatar-pass' : response.passed === false ? 'avatar-fail' : ''}`}>
            {response.submittedBy?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="detail-user-name">{response.submittedBy?.name || 'Unknown'}</div>
            <div className="detail-user-email">{response.submittedBy?.email}</div>
          </div>
        </div>
        <div className="detail-topbar-right">
          <div className="detail-assessment-name">{response.assessmentTitle}</div>
          <div className="detail-submitted-at">Submitted {fmt(response.submittedAt)}</div>
        </div>
      </div>

      {/* ── SCORE HERO ── */}
      {hasScore && (
        <div className={`score-hero ${response.passed ? 'score-hero-pass' : 'score-hero-fail'}`}>
          <div className="score-hero-left">
            <div className="score-big">
              <span className="score-num">{response.totalScore}</span>
              <span className="score-sep">/</span>
              <span className="score-max">{response.maxScore}</span>
            </div>
            <div className="score-label">Total Score</div>
          </div>

          <div className="score-ring-wrap">
            <svg viewBox="0 0 42 42" className="score-ring">
              <circle cx="21" cy="21" r="17" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
              <circle cx="21" cy="21" r="17" fill="none"
                stroke={response.passed ? '#4ade80' : '#f87171'}
                strokeWidth="4"
                strokeDasharray={`${response.percentage} ${100 - response.percentage}`}
                strokeDashoffset="25" strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <span className="score-ring-pct">{response.percentage}%</span>
          </div>

          <div className="score-hero-right">
            <ScoreBadge percentage={response.percentage} passed={response.passed} />
            <div className="score-breakdown-mini">
              <span className="sbm-correct">✓ {correct} correct</span>
              <span className="sbm-wrong">✕ {wrong} wrong</span>
              {manual > 0 && <span className="sbm-manual">⏳ {manual} manual</span>}
              {skipped > 0 && <span className="sbm-skip">— {skipped} skipped</span>}
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY SCORE STRIP ── */}
      {hasScore && (response.categoryScores || []).length > 1 && (
        <div className="cat-score-strip">
          {response.categoryScores.map((cs, i) => {
            const pct = cs.maxScore > 0 ? Math.round((cs.score / cs.maxScore) * 100) : 0;
            return (
              <div key={i} className="cat-score-card">
                <div className="cat-score-name">{cs.name}</div>
                <div className="cat-score-bar-wrap">
                  <div className="cat-score-bar">
                    <div className="cat-score-fill" style={{ width: `${pct}%`,
                      background: pct >= 60 ? 'var(--green)' : 'var(--red)' }}></div>
                  </div>
                  <span className="cat-score-pct">{pct}%</span>
                </div>
                <div className="cat-score-marks">{cs.score}/{cs.maxScore} marks</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── stat strip ── */}
      <div className="detail-stat-strip">
        <div className="detail-stat">
          <span className="ds-val">{totalAnswers}</span>
          <span className="ds-label">Answered</span>
        </div>
        <div className="detail-stat-divider"></div>
        <div className="detail-stat">
          <span className="ds-val" style={{ color: 'var(--green)' }}>{correct}</span>
          <span className="ds-label">Correct</span>
        </div>
        <div className="detail-stat-divider"></div>
        <div className="detail-stat">
          <span className="ds-val" style={{ color: 'var(--red)' }}>{wrong}</span>
          <span className="ds-label">Wrong</span>
        </div>
        <div className="detail-stat-divider"></div>
        <div className="detail-stat">
          <span className="ds-val" style={{ color: 'var(--yellow)' }}>{manual}</span>
          <span className="ds-label">Manual</span>
        </div>
        <div className="detail-stat-divider"></div>
        <div className="detail-stat">
          <span className="ds-val">{skipped}</span>
          <span className="ds-label">Skipped</span>
        </div>
      </div>

      {/* ── category tabs ── */}
      {catNames.length > 1 && (
        <div className="detail-cat-tabs">
          {catNames.map(cn => {
            const answers = Object.values(catMap[cn]).flat();
            const c = answers.filter(a => a.isCorrect === true).length;
            const w = answers.filter(a => a.isCorrect === false).length;
            return (
              <button key={cn}
                className={`detail-cat-tab ${activeTab === cn ? 'active' : ''}`}
                onClick={() => setActiveTab(cn)}>
                {cn}
                <span className="dct-score">
                  {c > 0 && <span className="dct-c">{c}✓</span>}
                  {w > 0 && <span className="dct-w">{w}✕</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── answers body ── */}
      <div className="detail-body">
        {catNames.map(catName => (
          <div key={catName}
            className={`detail-cat-section ${catNames.length > 1 && catName !== activeTab ? 'hidden-section' : ''}`}>

            {catNames.length > 1 && (
              <div className="detail-cat-heading">
                <span><Folder size={16} /></span><span>{catName}</span>
              </div>
            )}

            {Object.entries(catMap[catName]).map(([factorName, answers]) => (
              <div key={factorName} className="detail-factor-block">
                <div className="detail-factor-heading">
                  <span><Folder size={14} /></span>
                  <span className="detail-factor-name">{factorName}</span>
                  <span className="detail-factor-badge">{answers.length} Q</span>
                  {/* factor mini score */}
                  {answers.some(a => a.isCorrect !== null) && (
                    <span className="factor-score-mini">
                      {answers.filter(a=>a.isCorrect===true).length}/{answers.filter(a=>a.isCorrect!==null).length} correct
                    </span>
                  )}
                </div>

                <div className="detail-answers-list">
                  {answers.map((a, i) => (
                    <AnswerRow key={i} answer={a} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── single answer row ────────────────────────────────────────────────── */
const AnswerRow = ({ answer, index }) => {
  const hasAnswer = answer.answer !== undefined && answer.answer !== '' && answer.answer !== null;
  const isCorrect = answer.isCorrect;

  let rowClass = 'ar-neutral';
  if (isCorrect === true)  rowClass = 'ar-correct';
  if (isCorrect === false) rowClass = 'ar-wrong';
  if (isCorrect === null && hasAnswer) rowClass = 'ar-manual';
  if (!hasAnswer)          rowClass = 'ar-skipped';

  return (
    <div className={`answer-row ${rowClass}`}>

      {/* left: Q num + verdict */}
      <div className="ar-left">
        <span className="ar-qnum">Q{index + 1}</span>
        {isCorrect === true  && <CheckCircle size={16} className="ar-v-correct" />}
        {isCorrect === false && <XCircle size={16} className="ar-v-wrong" />}
        {isCorrect === null && hasAnswer && <Clock size={16} className="ar-v-manual" />}
        {!hasAnswer          && <Minus size={16} className="ar-v-skip" />}
      </div>

      {/* center: question + meta */}
      <div className="ar-center">
        <div className="ar-question-text">{answer.questionText}</div>
        <div className="ar-meta">
          <span className={`take-q-type-chip qtype-${answer.questionType}`}>
            {typeLabel(answer.questionType)}
          </span>
          <span className="ar-cat-path">{answer.categoryName} › {answer.factorName}</span>
          {answer.maxMarks > 0 && (
            <span className="ar-marks-chip">
              {answer.marksAwarded}/{answer.maxMarks} marks
            </span>
          )}
        </div>
      </div>

      {/* right: answer value + correct answer if wrong */}
      <div className="ar-right">
        {!hasAnswer ? (
          <span className="ar-skipped-label">Skipped</span>
        ) : (
          <div className="ar-answer-block">
            <AnswerDisplay answer={answer} />
            {isCorrect === false && answer.correctAnswer !== undefined && (
              <div className="ar-correct-ans">
                <span className="ar-correct-label">Correct:</span>
                <span className="ar-correct-val">{String(answer.correctAnswer)}</span>
              </div>
            )}
            {isCorrect === null && hasAnswer && (
              <div className="ar-manual-note">Manual review needed</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── answer display ───────────────────────────────────────────────────── */
const AnswerDisplay = ({ answer }) => {
  const val = answer.answer;

  switch (answer.questionType) {
    case 'rating':
      return (
        <div className="ad-rating">
          <div className="ad-stars">
            {[1,2,3,4,5].map(n => (
              <span key={n} className={`ad-star ${n <= Number(val) ? 'ad-star-filled' : ''}`}>★</span>
            ))}
          </div>
          <span className="ad-rating-num">{val}/5</span>
        </div>
      );
    case 'scale':
      const pct = ((Number(val) - 1) / 9) * 100;
      return (
        <div className="ad-scale">
          <div className="ad-scale-bar">
            <div className="ad-scale-fill" style={{ width: `${pct}%` }}></div>
          </div>
          <span className="ad-scale-num">{val}<span style={{color:'var(--text3)',fontSize:11}}>/10</span></span>
        </div>
      );
    case 'yes_no':
      return (
        <span className={`ad-yn ${val === 'Yes' ? 'ad-yn-yes' : 'ad-yn-no'}`}>
          {val === 'Yes' ? '✓ Yes' : '✕ No'}
        </span>
      );
    case 'multiple_choice':
      return <span className="ad-mc">{String(val)}</span>;
    case 'text':
    default:
      return (
        <div className="ad-text">
          <div className="ad-text-quote">"</div>
          <p className="ad-text-body">{String(val)}</p>
        </div>
      );
  }
};

export default Reports;
