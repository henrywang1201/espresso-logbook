// History screen — list of brews + tap-to-expand detail.
import { useState } from 'react';
import { C, ratioOf } from '../theme.js';
import { beanById } from '../data.js';
import { Bar, BeanDot, ScoreChip } from './frame.jsx';

export function HistoryScreen({ beans, brews }) {
  const [open, setOpen] = useState(null);

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
                      {[['粉量', br.dose.toFixed(1), 'g'], ['液重', br.yield.toFixed(1), 'g'], ['粉液比', ratioOf(br.dose, br.yield), ''],
                        ['时间', br.time, 's'], ['研磨', br.grind.toFixed(1), ''], ['水温', br.temp, '°C']].map(([l, val, u]) => (
                        <div key={l}>
                          <div style={{ fontSize: 10.5, color: C.taupe }}>{l}</div>
                          <div className="cd-num" style={{ fontSize: 17, fontWeight: 500, color: C.ink, marginTop: 1 }}>{val}<span style={{ fontSize: 10, color: C.taupe }}>{u}</span></div>
                        </div>
                      ))}
                    </div>
                    {br.tags && br.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                        {br.tags.map((t) => (
                          <span key={t} style={{ padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: C.cremaSoft, color: C.caramelDeep }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <button style={{ marginTop: 14, width: '100%', padding: '11px', borderRadius: 12, background: 'transparent',
                      border: `1px solid ${C.line}`, color: C.cocoa, fontSize: 13.5, fontWeight: 600 }}>用这组参数再冲一杯 ↻</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function mostUsed(beans, brews) {
  if (!brews.length) return '—';
  const counts = {};
  brews.forEach((b) => { counts[b.beanId] = (counts[b.beanId] || 0) + 1; });
  const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  const bean = beanById(beans, top);
  return bean.name.split(' · ')[0];
}
