// Beans library screen — bean cards with roast info, usage stats, set-active.
import { useState } from 'react';
import { C } from '../theme.js';
import { beanStats } from '../data.js';
import { Bar, RoundBtn, BeanDot, Plus, TrashIcon, Confirm } from './frame.jsx';

export function BeansScreen({ beans, brews, currentBean, setCurrentBean, setTab, onDeleteBean }) {
  const [confirmBean, setConfirmBean] = useState(null);
  return (
    <>
      <Bar title="豆子库" sub={`${beans.length} 款在用`} right={<RoundBtn solid><Plus/></RoundBtn>} />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 18px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {beans.map((b) => {
            const st = beanStats(brews, b.id);
            const active = b.id === currentBean.id;
            return (
              <div key={b.id} style={{ background: C.paper, border: `1.5px solid ${active ? C.caramel : C.line}`, borderRadius: 18, overflow: 'hidden' }}>
                <div style={{ padding: '15px 16px', display: 'flex', gap: 14 }}>
                  <BeanDot color={b.dot} size={52} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: C.ink, fontFamily: 'var(--serif)', lineHeight: 1.25 }}>{b.name}</span>
                      {active && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: C.caramel, padding: '2px 7px', borderRadius: 6, letterSpacing: '0.04em' }}>在用</span>}
                    </div>
                    <div style={{ fontSize: 12, color: C.taupe, marginTop: 2 }}>{b.roaster} · {b.origin}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
                      <Pill>{b.roast}</Pill>
                      <Pill>{b.process}</Pill>
                      <Pill mono>烘 {b.roastDate}</Pill>
                    </div>
                    <div style={{ fontSize: 12, color: C.cocoa, marginTop: 10, fontStyle: 'italic' }}>{b.notes}</div>
                  </div>
                  {beans.length > 1 && (
                    <button onClick={() => setConfirmBean(b)} aria-label="删除这款豆子" style={{ alignSelf: 'flex-start', width: 34, height: 34,
                      borderRadius: 10, color: C.taupe, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                      <TrashIcon size={17} />
                    </button>
                  )}
                </div>
                {/* stats footer */}
                <div style={{ display: 'flex', alignItems: 'center', borderTop: `1px solid ${C.lineSoft}`, background: C.paper2 }}>
                  <div style={{ flex: 1, padding: '10px 16px', display: 'flex', gap: 18 }}>
                    <Stat label="冲煮" value={st.count} unit="杯" />
                    <Stat label="平均分" value={st.avg != null ? st.avg.toFixed(1) : '—'} unit="" />
                    <Stat label="建议研磨" value={b.defGrind.toFixed(1)} unit="" />
                  </div>
                  {!active && (
                    <button onClick={() => { setCurrentBean(b); setTab('record'); }} style={{ alignSelf: 'stretch', padding: '0 18px',
                      background: 'transparent', color: C.caramel, fontSize: 13, fontWeight: 600, borderLeft: `1px solid ${C.lineSoft}`, whiteSpace: 'nowrap' }}>
                      用它冲 ›
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* add bean placeholder */}
          <button style={{ padding: '18px', borderRadius: 18, border: `1.5px dashed ${C.line}`, background: 'transparent',
            color: C.taupe, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Plus /> 添加新豆子
          </button>
        </div>
      </div>

      {confirmBean && (
        <Confirm title={`删除「${confirmBean.name}」？`}
          message="这款豆子将对所有人移除（已有的冲煮记录会保留，但不再关联到它）。"
          onCancel={() => setConfirmBean(null)}
          onConfirm={() => { onDeleteBean(confirmBean); setConfirmBean(null); }} />
      )}
    </>
  );
}

function Pill({ children, mono }) {
  return <span style={{ padding: '3px 10px', borderRadius: 8, background: C.cremaSoft, color: C.caramelDeep, fontSize: 11.5, fontWeight: 600, fontFamily: mono ? 'var(--mono)' : 'inherit' }}>{children}</span>;
}
function Stat({ label, value, unit }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: C.taupe }}>{label}</div>
      <div className="cd-num" style={{ fontSize: 16, fontWeight: 500, color: C.ink, marginTop: 1 }}>{value}<span style={{ fontSize: 10, color: C.taupe }}>{unit}</span></div>
    </div>
  );
}
