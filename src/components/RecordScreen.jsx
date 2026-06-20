// Record screen — B dial, bean selection, integrated timer feeding the time param.
import { useState, useRef, useEffect } from 'react';
import { C, ratioOf } from '../theme.js';
import { Bar, RoundBtn, BeanDot, Dots3 } from './frame.jsx';

// quick flavor / defect notes — tap to attach, or type your own
const FLAVOR_TAGS = ['太苦', '太酸', '太涩', '太咸', '太稀', '太浓', '焦苦', '寡淡', '平衡', '醇厚', '甜感', '回甘', '花香', '果酸'];

const PARAMS = {
  dose:  { label: '粉量', en: 'DOSE',  unit: 'g',  min: 14, max: 22, step: 0.1, fixed: 1 },
  yield: { label: '液重', en: 'YIELD', unit: 'g',  min: 20, max: 60, step: 0.5, fixed: 1 },
  grind: { label: '研磨', en: 'GRIND', unit: '',   min: 0,  max: 6,  step: 0.1, fixed: 1 },
  temp:  { label: '水温', en: 'TEMP',  unit: '°C', min: 88, max: 96, step: 0.5, fixed: 1 },
};

export function RecordScreen({ beans, currentBean, setCurrentBean, onSave }) {
  const [vals, setVals] = useState({ dose: currentBean.defDose, yield: 36.0, grind: currentBean.defGrind, temp: 93 });
  const [active, setActive] = useState('dose');
  const [time, setTime] = useState(28);          // the time parameter (seconds)
  const [pickBean, setPickBean] = useState(false);
  const [score, setScore] = useState(7);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);   // tap dial center → keypad entry
  const [draft, setDraft] = useState('');
  const [tags, setTags] = useState([]);             // flavor notes for this shot
  const [tagDraft, setTagDraft] = useState('');
  const scoreColor = score >= 8 ? C.good : score >= 6 ? C.caramel : C.warn;

  const toggleTag = (t) => setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
  const addCustomTag = () => {
    const t = tagDraft.trim();
    if (t && !tags.includes(t)) setTags((s) => [...s, t]);
    setTagDraft('');
  };

  // when bean changes, adopt its defaults
  useEffect(() => { setVals((s) => ({ ...s, dose: currentBean.defDose, grind: currentBean.defGrind })); }, [currentBean.id]);

  /* ── timer ── */
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);     // float seconds while running
  const [timeEditing, setTimeEditing] = useState(false);
  const [timeDraft, setTimeDraft] = useState('');
  const raf = useRef(null); const t0 = useRef(0); const base = useRef(0);
  const cancelTimeEdit = useRef(false);
  const tick = () => { setElapsed(base.current + (performance.now() - t0.current) / 1000); raf.current = requestAnimationFrame(tick); };
  const startTimer = () => { t0.current = performance.now(); setRunning(true); raf.current = requestAnimationFrame(tick); };
  const stopTimer = () => { cancelAnimationFrame(raf.current); setRunning(false); base.current = elapsed; setTime(Math.round(elapsed)); };
  const resetTimer = () => { cancelAnimationFrame(raf.current); setRunning(false); setTimeEditing(false); base.current = 0; setElapsed(0); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const displayTime = running || elapsed > 0 ? elapsed : time;
  const openTimeEdit = () => {
    if (running) return;
    setTimeDraft(String(Math.round(displayTime)));
    setTimeEditing(true);
  };
  const commitTimeEdit = () => {
    if (cancelTimeEdit.current) {
      cancelTimeEdit.current = false;
      setTimeEditing(false);
      setTimeDraft('');
      return;
    }
    setTimeEditing(false);
    const n = parseFloat(timeDraft);
    if (!Number.isNaN(n)) {
      const next = Math.max(0, Math.min(300, Math.round(n)));
      setTime(next);
      if (elapsed > 0) {
        setElapsed(next);
        base.current = next;
      }
    }
  };

  /* ── dial geometry ── */
  const p = PARAMS[active], v = vals[active];
  const frac = (v - p.min) / (p.max - p.min);
  const SWEEP = 280, START = -140, angle = START + frac * SWEEP;
  const dialRef = useRef(null), lastAng = useRef(null);
  const angleAt = (e) => { const r = dialRef.current.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
  const onDown = (e) => { e.preventDefault(); dialRef.current.setPointerCapture(e.pointerId); lastAng.current = angleAt(e); };
  const onMove = (e) => {
    if (lastAng.current == null) return;
    const a = angleAt(e); let d = a - lastAng.current;
    if (d > 180) d -= 360; if (d < -180) d += 360;
    lastAng.current = a;
    const perDeg = (p.max - p.min) / SWEEP;
    setVals((s) => { let nv = Math.max(p.min, Math.min(p.max, s[active] + d * perDeg)); nv = Math.round(nv / p.step) * p.step; return { ...s, [active]: +nv.toFixed(2) }; });
  };
  const onUp = (e) => { lastAng.current = null; try { dialRef.current.releasePointerCapture(e.pointerId); } catch {} };

  const D = 210, cx = D / 2, cy = D / 2, R = D / 2 - 5, ticks = 52;

  /* tap the dial center to type an exact value on the numeric keypad */
  useEffect(() => { setEditing(false); }, [active]);
  const openEdit = () => { setDraft(v.toFixed(p.fixed)); setEditing(true); };
  const commitEdit = () => {
    setEditing(false);
    const n = parseFloat(draft);
    if (!Number.isNaN(n)) {
      let nv = Math.max(p.min, Math.min(p.max, n));
      nv = Math.round(nv / p.step) * p.step;
      setVals((s) => ({ ...s, [active]: +nv.toFixed(2) }));
    }
  };

  const doSave = () => {
    onSave({ beanId: currentBean.id, dose: vals.dose, yield: vals.yield, time: Math.round(displayTime), grind: vals.grind, temp: vals.temp, score, tags });
    setTags([]); setTagDraft('');
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  return (
    <>
      <Bar title="记录一杯" sub="ESPRESSO" right={<RoundBtn><Dots3/></RoundBtn>} />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 18px 18px' }}>

        {/* bean selector */}
        <button onClick={() => setPickBean(true)} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '12px 14px',
          background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16, textAlign: 'left', marginBottom: 14 }}>
          <BeanDot color={currentBean.dot} size={40} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentBean.name}</span>
            <span style={{ display: 'block', fontSize: 11.5, color: C.taupe, marginTop: 1, fontFamily: 'var(--mono)' }}>{currentBean.roast} · {currentBean.process} · 烘 {currentBean.roastDate}</span>
          </span>
          <span style={{ fontSize: 11.5, color: C.caramel, fontWeight: 600, whiteSpace: 'nowrap' }}>切换 ›</span>
        </button>

        {/* dial */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div ref={dialRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            style={{ width: D, height: D, position: 'relative', touchAction: 'none', cursor: 'grab', userSelect: 'none' }}>
            <svg width={D} height={D} viewBox={`0 0 ${D} ${D}`} style={{ display: 'block' }}>
              {Array.from({ length: ticks }).map((_, i) => {
                const ta = START + (i / (ticks - 1)) * SWEEP, rad = ta * Math.PI / 180;
                const lit = (i / (ticks - 1)) <= frac, r1 = R - (i % 5 === 0 ? 15 : 9);
                return <line key={i} x1={cx + Math.cos(rad) * r1} y1={cy + Math.sin(rad) * r1} x2={cx + Math.cos(rad) * R} y2={cy + Math.sin(rad) * R}
                  stroke={lit ? C.caramel : C.line} strokeWidth={i % 5 === 0 ? 2.3 : 1.5} strokeLinecap="round" />;
              })}
            </svg>
            <div style={{ position: 'absolute', inset: 28, borderRadius: '50%', background: `radial-gradient(circle at 38% 32%, ${C.paper}, ${C.paper2})`,
              border: `1px solid ${C.line}`, boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.7), 0 10px 22px rgba(42,33,26,0.12)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 10.5, letterSpacing: '0.14em', color: C.taupe, fontFamily: 'var(--mono)' }}>{p.en}</div>
              {editing ? (
                <input
                  autoFocus
                  type="text"
                  inputMode="decimal"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ''))}
                  onBlur={commitEdit}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="cd-num"
                  style={{ width: 116, marginTop: 2, textAlign: 'center', fontSize: 44, fontWeight: 500, lineHeight: 1,
                    color: C.caramel, background: 'transparent', border: 'none', outline: 'none', padding: 0,
                    borderBottom: `2px solid ${C.caramel}` }}
                />
              ) : (
                <button onPointerDown={(e) => e.stopPropagation()} onClick={openEdit} aria-label="点按输入数值"
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'text' }}>
                  <span className="cd-num" style={{ display: 'block', fontSize: 48, fontWeight: 500, color: C.ink, lineHeight: 1, marginTop: 2 }}>{v.toFixed(p.fixed)}</span>
                </button>
              )}
              <div style={{ fontSize: 12.5, color: C.cocoa, marginTop: 3, fontFamily: 'var(--serif)' }}>{p.label} <span style={{ color: C.taupe }}>{p.unit}</span></div>
            </div>
            <div style={{ position: 'absolute', left: cx + Math.cos(angle * Math.PI / 180) * (R - 4) - 7, top: cy + Math.sin(angle * Math.PI / 180) * (R - 4) - 7,
              width: 14, height: 14, borderRadius: 7, background: C.caramel, boxShadow: '0 2px 6px rgba(169,106,57,0.5)', border: '2px solid #fff' }} />
          </div>
          <div style={{ fontSize: 11, color: C.taupe, marginTop: 0, fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>↻ 旋转微调 · 点中心键入 · 比 {ratioOf(vals.dose, vals.yield)}</div>
        </div>

        {/* param chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginTop: 14 }}>
          {Object.keys(PARAMS).map((k) => {
            const on = k === active;
            return (
              <button key={k} onClick={() => setActive(k)} style={{ padding: '9px 4px', borderRadius: 13, textAlign: 'center',
                background: on ? C.paper : 'transparent', border: `1.5px solid ${on ? C.caramel : C.line}`, transition: 'all .16s' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: on ? C.caramel : C.cocoa }}>{PARAMS[k].label}</div>
                <div className="cd-num" style={{ fontSize: 14, color: C.ink, marginTop: 2, fontWeight: 500 }}>
                  {vals[k].toFixed(PARAMS[k].fixed)}<span style={{ fontSize: 9.5, color: C.taupe }}>{PARAMS[k].unit}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* TIMER — feeds the time parameter */}
        <div style={{ marginTop: 12, padding: '14px 16px', background: running ? C.ink : C.paper, border: `1px solid ${running ? C.ink : C.line}`,
          borderRadius: 18, display: 'flex', alignItems: 'center', gap: 14, transition: 'background .2s' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', fontFamily: 'var(--mono)', color: running ? 'rgba(255,255,255,0.55)' : C.taupe }}>萃取计时 · TIME</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 1 }}>
              {timeEditing ? (
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  value={timeDraft}
                  onChange={(e) => setTimeDraft(e.target.value.replace(/[^0-9.]/g, ''))}
                  onBlur={commitTimeEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') { cancelTimeEdit.current = true; e.currentTarget.blur(); }
                  }}
                  className="cd-num"
                  style={{ width: 82, fontSize: 38, fontWeight: 500, color: C.ink, lineHeight: 1,
                    background: 'transparent', border: 'none', borderBottom: `2px solid ${C.caramel}`,
                    outline: 'none', padding: 0 }}
                />
              ) : (
                <button onClick={openTimeEdit} disabled={running} className="cd-num" aria-label="修改萃取时间"
                  style={{ fontSize: 38, fontWeight: 500, color: running ? '#fff' : C.ink, lineHeight: 1,
                    padding: 0, cursor: running ? 'default' : 'text' }}>
                  {displayTime.toFixed(running ? 1 : 0)}
                </button>
              )}
              <span style={{ fontSize: 13, color: running ? 'rgba(255,255,255,0.5)' : C.taupe, fontFamily: 'var(--mono)' }}>s →参数</span>
            </div>
          </div>
          {(elapsed > 0 && !running) && (
            <button onClick={resetTimer} style={{ width: 46, height: 46, borderRadius: 14, background: C.paper2, border: `1px solid ${C.line}`,
              color: C.cocoa, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 10a7 7 0 1 1 2 5"/><path d="M3 6v4h4"/></svg>
            </button>
          )}
          <button onClick={running ? stopTimer : startTimer} style={{
            width: 58, height: 58, borderRadius: 18, flex: '0 0 auto',
            background: running ? '#fff' : C.caramel, color: running ? C.ink : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: running ? 'none' : '0 6px 16px rgba(169,106,57,0.35)' }}>
            {running
              ? <span style={{ width: 17, height: 17, borderRadius: 4, background: C.ink }} />
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5l12 7-12 7z"/></svg>}
          </button>
        </div>

        {/* FLAVOR SCORE — tap to rate 1–10 */}
        <div style={{ marginTop: 12, padding: '14px 16px', background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', fontFamily: 'var(--mono)', color: C.taupe }}>风味评分 · SCORE</div>
            <div className="cd-num" style={{ fontSize: 18, fontWeight: 600, color: scoreColor }}>
              {score}.0<span style={{ fontSize: 11, color: C.taupe, fontWeight: 400 }}> /10</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 11 }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const val = i + 1, on = val <= score;
              return (
                <button key={val} onClick={() => setScore(val)} aria-label={`评分 ${val}`} style={{
                  flex: 1, height: 28, borderRadius: 7, background: on ? scoreColor : C.paper2,
                  border: `1px solid ${on ? scoreColor : C.line}`, transition: 'background .12s, border-color .12s' }} />
              );
            })}
          </div>
        </div>

        {/* FLAVOR TAGS — tap presets or add your own */}
        <div style={{ marginTop: 12, padding: '14px 16px', background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', fontFamily: 'var(--mono)', color: C.taupe }}>风味标签 · NOTES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 11 }}>
            {FLAVOR_TAGS.map((t) => {
              const on = tags.includes(t);
              return (
                <button key={t} onClick={() => toggleTag(t)} style={{ padding: '7px 13px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                  background: on ? C.caramel : C.paper2, color: on ? '#fff' : C.cocoa,
                  border: `1px solid ${on ? C.caramel : C.line}`, transition: 'all .14s' }}>{t}</button>
              );
            })}
            {tags.filter((t) => !FLAVOR_TAGS.includes(t)).map((t) => (
              <button key={t} onClick={() => toggleTag(t)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 11px 7px 13px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                background: C.caramel, color: '#fff', border: `1px solid ${C.caramel}` }}>
                {t}<span style={{ fontSize: 15, lineHeight: 1, opacity: 0.85 }}>×</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
            <input
              type="text"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
              placeholder="自定义风味…"
              style={{ flex: 1, minWidth: 0, padding: '10px 13px', borderRadius: 12, fontSize: 13.5,
                background: C.paper2, border: `1px solid ${C.line}`, color: C.ink, outline: 'none' }}
            />
            <button onClick={addCustomTag} disabled={!tagDraft.trim()} style={{ flex: '0 0 auto', padding: '0 16px', borderRadius: 12,
              fontSize: 14, fontWeight: 600, background: tagDraft.trim() ? C.ink : C.paper2,
              color: tagDraft.trim() ? '#fff' : C.taupe, border: `1px solid ${tagDraft.trim() ? C.ink : C.line}` }}>添加</button>
          </div>
        </div>
      </div>

      {/* save */}
      <div style={{ flex: '0 0 auto', padding: '10px 18px 14px', background: C.bg }}>
        <button onClick={doSave} style={{ width: '100%', padding: '15px', borderRadius: 16, background: C.caramel, color: '#fff',
          fontSize: 16, fontWeight: 600, boxShadow: '0 8px 20px rgba(169,106,57,0.3)' }}>保存这一杯</button>
      </div>

      {pickBean && <BeanPicker beans={beans} current={currentBean} onPick={(b) => { setCurrentBean(b); setPickBean(false); }} onClose={() => setPickBean(false)} />}
      {saved && <Toast />}
    </>
  );
}

/* bean picker bottom sheet */
function BeanPicker({ beans, current, onPick, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(42,33,26,0.4)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backdropFilter: 'blur(2px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, borderRadius: '24px 24px 0 0', padding: '10px 18px 30px', maxHeight: '76%', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.line, margin: '4px auto 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600 }}>选择咖啡豆</span>
          <span style={{ fontSize: 12, color: C.taupe }}>{beans.length} 款</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {beans.map((b) => {
            const on = b.id === current.id;
            return (
              <button key={b.id} onClick={() => onPick(b)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px',
                background: C.paper, border: `1.5px solid ${on ? C.caramel : C.line}`, borderRadius: 16, textAlign: 'left' }}>
                <BeanDot color={b.dot} size={42} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: C.ink }}>{b.name}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: C.taupe, marginTop: 1 }}>{b.notes}</span>
                </span>
                {on && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.caramel} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l5 5L19 7"/></svg>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Toast() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(42,33,26,0.32)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
      <div style={{ background: C.paper, borderRadius: 20, padding: '26px 30px', display: 'flex',
        flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
        <div style={{ width: 54, height: 54, borderRadius: 27, background: C.good, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'cd-pop .4s' }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13.5l5 5L21 7.5"/></svg>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600 }}>已存入冲煮日志</div>
      </div>
    </div>
  );
}
