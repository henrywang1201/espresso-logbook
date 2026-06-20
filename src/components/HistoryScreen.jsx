// History screen — list of brews + tap-to-expand detail.
import { useEffect, useRef, useState } from 'react';
import { C, ratioOf } from '../theme.js';
import { beanById } from '../data.js';
import { Bar, BeanDot, ScoreChip, TrashIcon, Confirm } from './frame.jsx';

const BREW_PARAMS = [
  { key: 'dose', label: '粉量', unit: 'g', min: 0, max: 40, step: 0.1, fixed: 1 },
  { key: 'yield', label: '液重', unit: 'g', min: 0, max: 120, step: 0.1, fixed: 1 },
  { key: 'time', label: '时间', unit: 's', min: 0, max: 300, step: 1, fixed: 0 },
  { key: 'grind', label: '研磨', unit: '', min: 0, max: 12, step: 0.1, fixed: 1 },
  { key: 'temp', label: '水温', unit: '°C', min: 0, max: 100, step: 0.5, fixed: 1 },
];

export function HistoryScreen({ beans, brews, onDeleteBrew, onEditBrew }) {
  const [open, setOpen] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const total = brews.length;
  const avg = total ? (brews.reduce((s, b) => s + b.score, 0) / total).toFixed(1) : '—';

  return (
    <>
      <Bar title="冲煮日志" sub={`${total} 杯 · 平均 ${avg} 分`} />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 18px 20px' }}>
        {/* summary strip */}
        <div style={{ display: 'flex', gap: 0, background: C.ink, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
          {[['本周', brews.length, '杯'], ['平均分', avg, ''], ['最常用', mostUsed(beans, brews), '']].map(([l, val, u], i) => (
            <div key={l} style={{ flex: 1, padding: '14px 8px', textAlign: 'center', borderLeft: i ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>{l}</div>
              <div className="cd-num" style={{ fontSize: typeof val === 'string' && val.length > 4 ? 14 : 22, fontWeight: 500, color: '#fff', marginTop: 4, lineHeight: 1.1 }}>{val}<span style={{ fontSize: 11, opacity: 0.5 }}>{u}</span></div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {brews.map((br) => {
            const bean = beanById(beans, br.beanId);
            const isOpen = open === br.id;
            return (
              <div key={br.id} style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16, overflow: 'hidden' }}>
                <button onClick={() => setOpen(isOpen ? null : br.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', textAlign: 'left' }}>
                  <BeanDot color={bean.dot} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bean.name}</div>
                    <div className="cd-num" style={{ fontSize: 11.5, color: C.taupe, marginTop: 2 }}>{br.date} · {ratioOf(br.dose, br.yield)} · {br.time}s</div>
                  </div>
                  <ScoreChip s={br.score} />
                </button>
                {isOpen && (
                  <div className="cd-fade" style={{ borderTop: `1px solid ${C.lineSoft}`, padding: '14px 15px', background: C.paper2 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10.5, color: C.taupe }}>粉液比</div>
                        <div className="cd-num" style={{ fontSize: 17, fontWeight: 500, color: C.ink, marginTop: 8 }}>{ratioOf(br.dose, br.yield)}</div>
                      </div>
                      {BREW_PARAMS.map((param) => (
                        <EditableBrewParam key={param.key} brew={br} param={param} onEditBrew={onEditBrew} />
                      ))}
                    </div>
                    {br.tags && br.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                        {br.tags.map((t) => (
                          <span key={t} style={{ padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: C.cremaSoft, color: C.caramelDeep }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'transparent',
                        border: `1px solid ${C.line}`, color: C.cocoa, fontSize: 13.5, fontWeight: 600 }}>用这组参数再冲一杯 ↻</button>
                      <button onClick={() => setConfirmId(br.id)} aria-label="删除这条记录" style={{ width: 44, flex: '0 0 auto', borderRadius: 12,
                        background: 'transparent', border: `1px solid ${C.line}`, color: '#b04a35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {confirmId && (
        <Confirm title="删除这条冲煮记录？" message="删除后所有人都将看不到这条记录，无法恢复。"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => { onDeleteBrew(confirmId); setConfirmId(null); }} />
      )}
    </>
  );
}

function EditableBrewParam({ brew, param, onEditBrew }) {
  const value = brew[param.key];
  const [draft, setDraft] = useState(formatParam(value, param));
  const [saving, setSaving] = useState(false);
  const cancelEdit = useRef(false);

  useEffect(() => { setDraft(formatParam(value, param)); }, [value, param]);

  const commit = async () => {
    if (cancelEdit.current) {
      cancelEdit.current = false;
      setDraft(formatParam(value, param));
      return;
    }
    const n = parseFloat(draft);
    if (Number.isNaN(n)) {
      setDraft(formatParam(value, param));
      return;
    }
    let next = Math.max(param.min, Math.min(param.max, n));
    next = Math.round(next / param.step) * param.step;
    next = param.fixed === 0 ? Math.round(next) : +next.toFixed(param.fixed);
    setDraft(formatParam(next, param));
    if (next === Number(value)) return;
    setSaving(true);
    try {
      await onEditBrew?.(brew.id, { [param.key]: next });
    } finally {
      setSaving(false);
    }
  };

  return (
    <label style={{ display: 'block', minWidth: 0 }}>
      <div style={{ fontSize: 10.5, color: C.taupe }}>{param.label}</div>
      <div style={{ position: 'relative', marginTop: 4 }}>
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ''))}
          onBlur={commit}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') { cancelEdit.current = true; e.currentTarget.blur(); }
          }}
          className="cd-num"
          style={{ width: '100%', minWidth: 0, padding: param.unit ? '7px 21px 7px 8px' : '7px 8px',
            borderRadius: 10, border: `1px solid ${saving ? C.caramel : C.line}`,
            background: saving ? C.cremaSoft : C.paper, color: C.ink, outline: 'none',
            fontSize: 16, fontWeight: 500, transition: 'border-color .15s, background .15s' }}
        />
        {param.unit && <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          fontSize: 10, color: C.taupe, pointerEvents: 'none' }}>{param.unit}</span>}
      </div>
    </label>
  );
}

function formatParam(value, param) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return param.fixed === 0 ? String(Math.round(n)) : n.toFixed(param.fixed);
}

function mostUsed(beans, brews) {
  if (!brews.length) return '—';
  const counts = {};
  brews.forEach((b) => { counts[b.beanId] = (counts[b.beanId] || 0) + 1; });
  const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  const bean = beanById(beans, top);
  return bean.name.split(' · ')[0];
}
