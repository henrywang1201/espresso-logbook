// Recipes / 配方小抄 — espresso drink build cheat-sheet with layered-glass viz.
import { useState } from 'react';
import { C } from '../theme.js';
import { LAYER_META, layerMl, drinkSummary } from '../data.js';
import { Bar, RoundBtn, Plus, TrashIcon, Confirm } from './frame.jsx';

let __glassN = 0;

/* Cross-section glass with proportional liquid layers (bottom → top). */
export function LayeredGlass({ layers, w = 120, h = 158 }) {
  const META = LAYER_META;
  const total = layers.reduce((s, l) => s + l.ml, 0) || 1;
  const VW = 100, VH = 132;
  // tapered tumbler interior
  const liqTop = 16, liqBot = 121, liqH = liqBot - liqTop;
  // build bands bottom-up
  let yCur = liqBot;
  const bands = layers.map((l) => { const bh = (l.ml / total) * liqH; const y = yCur - bh; yCur -= bh; return { ...l, y, bh }; });
  const topBand = bands[bands.length - 1];
  const clipId = 'gclip' + (__glassN++);
  const glassPath = 'M15 9 L85 9 L80 119 Q79 125 73 125 L27 125 Q21 125 20 119 Z';
  // surface ellipse width at given y (interpolate top 70 → bottom 58)
  const surfW = (y) => 70 - (62 / VH) * (y - 9) + 4;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id={clipId}><path d={glassPath} /></clipPath>
      </defs>
      {/* empty glass tint */}
      <path d={glassPath} fill="#ffffff" fillOpacity="0.45" />
      <g clipPath={`url(#${clipId})`}>
        {bands.map((b, i) => (
          <rect key={i} x="0" y={b.y} width="100" height={b.bh + 0.6} fill={META[b.t].color} />
        ))}
        {/* soft layer separations */}
        {bands.slice(1).map((b, i) => (
          <rect key={'s' + i} x="0" y={b.y - 0.5} width="100" height="1" fill="rgba(0,0,0,0.06)" />
        ))}
        {/* liquid surface sheen on top band */}
        {topBand && <ellipse cx="50" cy={topBand.y} rx={surfW(topBand.y) / 2} ry="3.4" fill="#ffffff" fillOpacity="0.22" />}
        {/* glass vertical highlight */}
        <rect x="26" y="12" width="7" height="108" rx="3.5" fill="#ffffff" fillOpacity="0.30" />
      </g>
      {/* rim */}
      <ellipse cx="50" cy="9" rx="35" ry="4.2" fill="none" stroke={C.taupe} strokeWidth="1.4" opacity="0.55" />
      {/* glass outline */}
      <path d={glassPath} fill="none" stroke={C.cocoa} strokeWidth="1.6" strokeOpacity="0.6" strokeLinejoin="round" />
    </svg>
  );
}

export function RecipesScreen({ drinks, addDrink, onDeleteDrink }) {
  const [open, setOpen] = useState(null);     // drink detail
  const [build, setBuild] = useState(false);  // builder sheet

  return (
    <>
      <Bar title="配方小抄" sub="ESPRESSO DRINKS" right={<RoundBtn solid onClick={() => setBuild(true)}><Plus/></RoundBtn>} />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 20px' }}>
        <div style={{ fontSize: 12, color: C.taupe, marginBottom: 12, lineHeight: 1.5 }}>
          以一份浓缩（18g→36g）为基准的常见意式饮品配方 · 点开看分层与做法
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {drinks.map((d) => (
            <button key={d.id} onClick={() => setOpen(d)} style={{
              background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18, padding: '14px 12px 13px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 92 }}>
                <LayeredGlass layers={d.layers} w={70} h={92} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: C.ink }}>{d.name}</span>
                {!d.preset && <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff', background: C.sage, padding: '1px 6px', borderRadius: 5 }}>我的</span>}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: C.taupe, letterSpacing: '0.06em' }}>{d.en} · {d.cup}ml</div>
              <div style={{ fontSize: 11, color: C.cocoa, marginTop: 5, lineHeight: 1.35 }}>{drinkSummary(d)}</div>
            </button>
          ))}
        </div>
      </div>

      {open && <DrinkDetail drink={open} onClose={() => setOpen(null)}
        onDelete={() => { onDeleteDrink(open); setOpen(null); }} />}
      {build && <RecipeBuilder onClose={() => setBuild(false)} onSave={(d) => { addDrink(d); setBuild(false); }} />}
    </>
  );
}

/* Detail bottom sheet — big glass + labeled layer legend + build */
function DrinkDetail({ drink, onClose, onDelete }) {
  const META = LAYER_META;
  const esp = layerMl(drink, 'espresso');
  const milk = layerMl(drink, 'milk') + layerMl(drink, 'foam');
  const total = drink.layers.reduce((s, l) => s + l.ml, 0);
  const [confirm, setConfirm] = useState(false);
  return (
    <Sheet onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: C.ink }}>{drink.name}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: C.taupe, letterSpacing: '0.08em', marginTop: 2 }}>{drink.en} · {drink.cup}ml 杯</div>
        </div>
        {esp > 0 && milk > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, color: C.taupe, fontFamily: 'var(--mono)' }}>浓缩 : 奶</div>
            <div className="cd-num" style={{ fontSize: 22, fontWeight: 500, color: C.caramel }}>1 : {(milk / esp).toFixed(1)}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
        <div style={{ flex: '0 0 auto' }}><LayeredGlass layers={drink.layers} w={118} h={156} /></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[...drink.layers].reverse().map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 16, height: 16, borderRadius: 5, background: META[l.t].color, border: `1px solid ${C.line}`, flex: '0 0 auto' }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: C.ink }}>{META[l.t].label}</span>
              <span className="cd-num" style={{ fontSize: 15, fontWeight: 500, color: C.cocoa }}>{l.ml}<span style={{ fontSize: 11, color: C.taupe }}>ml</span></span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.lineSoft}`, marginTop: 3, paddingTop: 9, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: C.taupe }}>总量</span>
            <span className="cd-num" style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{total}ml</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, padding: '13px 15px', background: C.paper2, borderRadius: 14, fontSize: 13.5, color: C.cocoa, lineHeight: 1.55 }}>
        <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, color: C.ink }}>做法 · </span>{drink.note}
      </div>

      <button onClick={() => setConfirm(true)} style={{ marginTop: 14, width: '100%', padding: '12px', borderRadius: 13,
        background: 'transparent', border: `1px solid ${C.line}`, color: '#b04a35', fontSize: 14, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <TrashIcon size={16} /> 删除此配方
      </button>

      {confirm && (
        <Confirm title={`删除「${drink.name}」配方？`} message="该配方将从所有人的小抄中移除，无法恢复。"
          onCancel={() => setConfirm(false)} onConfirm={onDelete} />
      )}
    </Sheet>
  );
}

/* Builder — add a custom recipe by adjusting ingredient ml */
function RecipeBuilder({ onClose, onSave }) {
  const ORDER = ['chocolate', 'espresso', 'water', 'milk', 'foam'];
  const META = LAYER_META;
  const [name, setName] = useState('');
  const [amt, setAmt] = useState({ espresso: 36, milk: 120, foam: 15, water: 0, chocolate: 0 });
  const layers = ORDER.filter((t) => amt[t] > 0).map((t) => ({ t, ml: amt[t] }));
  const total = ORDER.reduce((s, t) => s + amt[t], 0);
  const set = (t, d) => setAmt((s) => ({ ...s, [t]: Math.max(0, s[t] + d) }));

  const doSave = () => {
    onSave({ id: 'd' + Date.now(), name: name.trim() || '自定义配方', en: 'MY RECIPE', cup: Math.round(total / 10) * 10 || 60,
      tag: '我的', preset: false, layers: layers.length ? layers : [{ t: 'espresso', ml: 36 }],
      note: '我保存的配方。' });
  };

  return (
    <Sheet onClose={onClose}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: C.ink, marginBottom: 4 }}>添加配方</div>
      <div style={{ fontSize: 12, color: C.taupe, marginBottom: 16 }}>调整各成分用量，实时预览分层</div>

      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LayeredGlass layers={layers.length ? layers : [{ t: 'espresso', ml: 1 }]} w={86} h={120} />
          <div className="cd-num" style={{ fontSize: 13, color: C.cocoa, marginTop: 8 }}>{total}<span style={{ fontSize: 10, color: C.taupe }}>ml</span></div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ORDER.map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 13, height: 13, borderRadius: 4, background: META[t].color, border: `1px solid ${C.line}`, flex: '0 0 auto' }} />
              <span style={{ flex: 1, fontSize: 13.5, color: C.ink, fontWeight: 500 }}>{META[t].label}</span>
              <button onClick={() => set(t, -5)} style={mini()}>−</button>
              <span className="cd-num" style={{ minWidth: 42, textAlign: 'center', fontSize: 15, fontWeight: 500, color: C.ink }}>{amt[t]}</span>
              <button onClick={() => set(t, 5)} style={mini()}>+</button>
            </div>
          ))}
        </div>
      </div>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="配方名称（如：燕麦拿铁）" style={{
        width: '100%', marginTop: 18, padding: '13px 15px', borderRadius: 13, border: `1px solid ${C.line}`,
        background: C.paper, fontSize: 15, color: C.ink, fontFamily: 'var(--sans)', outline: 'none' }} />

      <button onClick={doSave} style={{ width: '100%', marginTop: 12, padding: '15px', borderRadius: 16, background: C.caramel,
        color: '#fff', fontSize: 16, fontWeight: 600, boxShadow: '0 8px 20px rgba(169,106,57,0.3)' }}>保存到小抄</button>
    </Sheet>
  );
}
function mini() { return { width: 32, height: 32, borderRadius: 9, background: C.paper2, border: `1px solid ${C.line}`, fontSize: 18, color: C.cocoa, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }; }

/* generic bottom sheet */
function Sheet({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(42,33,26,0.42)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backdropFilter: 'blur(2px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, borderRadius: '24px 24px 0 0',
        padding: '10px 20px 30px', maxHeight: '88%', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.line, margin: '4px auto 16px' }} />
        {children}
      </div>
    </div>
  );
}
