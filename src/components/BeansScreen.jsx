// Beans library screen — bean cards with roast info, usage stats, set-active, add/edit/delete.
import { useState } from 'react';
import { C } from '../theme.js';
import { beanStats } from '../data.js';
import { Bar, RoundBtn, BeanDot, Plus, TrashIcon, EditIcon, Confirm, Sheet } from './frame.jsx';

export function BeansScreen({ beans, brews, currentBean, setCurrentBean, setTab, onDeleteBean, onAddBean, onEditBean }) {
  const [confirmBean, setConfirmBean] = useState(null);
  const [form, setForm] = useState(null); // { mode:'create'|'edit', bean? }

  const iconBtn = { width: 32, height: 32, borderRadius: 10, color: C.taupe, display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <>
      <Bar title="豆子库" sub={`${beans.length} 款在用`} right={<RoundBtn solid onClick={() => setForm({ mode: 'create' })}><Plus/></RoundBtn>} />
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
                  <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 2, flex: '0 0 auto' }}>
                    <button onClick={() => setForm({ mode: 'edit', bean: b })} aria-label="编辑这款豆子" style={iconBtn}><EditIcon size={17} /></button>
                    {beans.length > 1 && (
                      <button onClick={() => setConfirmBean(b)} aria-label="删除这款豆子" style={iconBtn}><TrashIcon size={17} /></button>
                    )}
                  </div>
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

          {/* add bean */}
          <button onClick={() => setForm({ mode: 'create' })} style={{ padding: '18px', borderRadius: 18, border: `1.5px dashed ${C.line}`, background: 'transparent',
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

      {form && (
        <BeanForm mode={form.mode} bean={form.bean} onClose={() => setForm(null)}
          onSubmit={(a, b) => { form.mode === 'edit' ? onEditBean(a, b) : onAddBean(a); setForm(null); }} />
      )}
    </>
  );
}

/* Add / edit bean form (bottom sheet) */
function BeanForm({ mode, bean, onClose, onSubmit }) {
  const init = bean || {};
  const [f, setF] = useState({
    name: init.name || '', roaster: init.roaster || '', origin: init.origin || '',
    roast: init.roast || '中烘', process: init.process || '水洗', roastDate: init.roastDate || '',
    notes: init.notes || '', defDose: init.defDose ?? 18.0, defGrind: init.defGrind ?? 2.4,
    dot: init.dot || '#9a5a2e',
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const ROASTS = ['浅烘', '中烘', '中深烘', '深烘'];
  const DOTS = ['#c98a4a', '#9a5a2e', '#6e3d1f', '#4a2814', '#7d8466', '#a96a39'];

  const submit = () => {
    const payload = {
      name: f.name.trim() || '未命名豆子', roaster: f.roaster.trim(), origin: f.origin.trim(),
      roast: f.roast, process: f.process.trim() || '—', roastDate: f.roastDate.trim() || '—',
      notes: f.notes.trim(), defDose: +(+f.defDose).toFixed(1), defGrind: +(+f.defGrind).toFixed(1), dot: f.dot,
    };
    if (mode === 'edit') onSubmit(bean.id, payload); else onSubmit(payload);
  };

  return (
    <Sheet onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <BeanDot color={f.dot} size={44} />
        <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: C.ink }}>
          {mode === 'edit' ? '编辑豆子' : '添加豆子'}
        </div>
      </div>

      <Field label="名称"><input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="如：耶加雪菲 · 科契尔" style={inputStyle} /></Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="烘焙商"><input value={f.roaster} onChange={(e) => set('roaster', e.target.value)} placeholder="晨光烘焙" style={inputStyle} /></Field>
        <Field label="产地"><input value={f.origin} onChange={(e) => set('origin', e.target.value)} placeholder="埃塞俄比亚" style={inputStyle} /></Field>
      </div>

      <Field label="烘焙度">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ROASTS.map((r) => {
            const on = f.roast === r;
            return <button key={r} onClick={() => set('roast', r)} style={{ padding: '8px 13px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: on ? C.caramel : C.paper, color: on ? '#fff' : C.cocoa, border: `1px solid ${on ? C.caramel : C.line}` }}>{r}</button>;
          })}
        </div>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="处理法"><input value={f.process} onChange={(e) => set('process', e.target.value)} placeholder="日晒 / 水洗" style={inputStyle} /></Field>
        <Field label="烘焙日"><input value={f.roastDate} onChange={(e) => set('roastDate', e.target.value)} placeholder="05-22" style={inputStyle} /></Field>
      </div>

      <Field label="风味描述"><input value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="柑橘 · 茉莉 · 红茶" style={inputStyle} /></Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="默认粉量 g"><Stepper value={f.defDose} set={(v) => set('defDose', v)} min={14} max={22} step={0.5} unit="g" /></Field>
        <Field label="建议研磨"><Stepper value={f.defGrind} set={(v) => set('defGrind', v)} min={0} max={6} step={0.1} unit="" /></Field>
      </div>

      <Field label="标识色">
        <div style={{ display: 'flex', gap: 10 }}>
          {DOTS.map((c) => (
            <button key={c} onClick={() => set('dot', c)} aria-label={c} style={{ width: 36, height: 36, borderRadius: 11, background: c,
              border: 'none', boxShadow: f.dot === c ? `0 0 0 2px ${C.bg}, 0 0 0 4px ${C.ink}` : 'none' }} />
          ))}
        </div>
      </Field>

      <button onClick={submit} style={{ width: '100%', marginTop: 8, padding: '15px', borderRadius: 16, background: C.caramel,
        color: '#fff', fontSize: 16, fontWeight: 600, boxShadow: '0 8px 20px rgba(169,106,57,0.3)' }}>
        {mode === 'edit' ? '保存修改' : '添加到豆子库'}
      </button>
    </Sheet>
  );
}

const inputStyle = { width: '100%', padding: '11px 13px', borderRadius: 12, border: `1px solid ${C.line}`,
  background: C.paper, fontSize: 14.5, color: C.ink, fontFamily: 'var(--sans)', outline: 'none' };

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, color: C.taupe, marginBottom: 5, fontWeight: 600 }}>{label}</div>
      {children}
    </label>
  );
}

function Stepper({ value, set, min, max, step, unit }) {
  const fixed = step < 1 ? 1 : 0;
  const dec = () => set(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => set(Math.min(max, +(value + step).toFixed(2)));
  const btn = { width: 34, height: 34, borderRadius: 10, background: C.paper2, border: `1px solid ${C.line}`,
    fontSize: 18, color: C.cocoa, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={dec} style={btn}>−</button>
      <span className="cd-num" style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 500, color: C.ink }}>
        {(+value).toFixed(fixed)}<span style={{ fontSize: 10, color: C.taupe }}>{unit}</span>
      </span>
      <button onClick={inc} style={btn}>+</button>
    </div>
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
