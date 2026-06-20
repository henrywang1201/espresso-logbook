// espresso-logbook — responsive app shell + bottom nav + shared bits
import { useEffect } from 'react';
import { C, ratioOf } from '../theme.js';

export { ratioOf };

function useViewportHeightVar() {
  useEffect(() => {
    const setViewportHeight = () => {
      const h = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--cd-viewport-height', `${Math.round(h)}px`);
    };

    setViewportHeight();
    window.visualViewport?.addEventListener('resize', setViewportHeight);
    window.visualViewport?.addEventListener('scroll', setViewportHeight);
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    window.addEventListener('pageshow', setViewportHeight);

    return () => {
      window.visualViewport?.removeEventListener('resize', setViewportHeight);
      window.visualViewport?.removeEventListener('scroll', setViewportHeight);
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
      window.removeEventListener('pageshow', setViewportHeight);
    };
  }, []);
}

/* Responsive app surface: edge-to-edge on phones, a centered comfortable
   column on tablet/desktop (no device bezel, no fake status bar). */
export function AppShell({ children }) {
  useViewportHeightVar();

  return (
    <div className="cd-viewport">
      <div className="cd-shell">
        {children}
      </div>
    </div>
  );
}

/* Bottom nav */
const NAV = [
  { id: 'record', label: '记录', icon: (a) => <DialIcon on={a} /> },
  { id: 'recipes', label: '配方', icon: (a) => <CupIcon on={a} /> },
  { id: 'history', label: '历史', icon: (a) => <ListIcon on={a} /> },
  { id: 'beans', label: '豆子', icon: (a) => <BeanIcon on={a} /> },
];
export function BottomNav({ tab, setTab }) {
  return (
    <div className="cd-bottom-nav">
      <div className="cd-bottom-nav-row">
        {NAV.map((n) => {
          const on = n.id === tab;
          return (
            <button
              key={n.id}
              aria-current={on ? 'page' : undefined}
              className="cd-bottom-nav-button"
              onClick={() => setTab(n.id)}
              style={{ color: on ? C.caramel : C.taupe }}
            >
              {n.icon(on)}
              <span>{n.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* App bar */
export function Bar({ title, sub, left, right }) {
  return (
    <div style={{ flex: '0 0 auto', padding: '12px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 40 }}>{left}</div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: C.ink, lineHeight: 1.05 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: C.taupe, marginTop: 2, fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>{sub}</div>}
      </div>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}
export function RoundBtn({ children, onClick, solid }) {
  return (
    <button onClick={onClick} style={{ width: 40, height: 40, borderRadius: 13, display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: solid ? C.ink : 'transparent', color: solid ? '#fff' : C.cocoa,
      border: solid ? 'none' : `1px solid ${C.line}` }}>{children}</button>
  );
}

/* Score chip */
export function ScoreChip({ s }) {
  const col = s >= 8 ? C.good : s >= 6 ? C.caramel : C.warn;
  return (
    <span className="cd-num" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 9px',
      borderRadius: 8, background: col, color: '#fff', fontSize: 13, fontWeight: 500 }}>
      <svg width="11" height="11" viewBox="0 0 11 11" fill="#fff"><path d="M5.5 0l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7L2.3 10l.6-3.6L.3 3.8l3.6-.5z"/></svg>
      {s}.0
    </span>
  );
}

/* Bean dot with glyph */
export function BeanDot({ color, size = 38 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size * 0.28, background: color, flex: '0 0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 20 20" fill="none">
        <ellipse cx="10" cy="10" rx="6.5" ry="8.5" stroke="#fff" strokeWidth="1.4" opacity="0.9"/>
        <path d="M10 2.5C7 6 7 14 10 17.5" stroke="#fff" strokeWidth="1.4" opacity="0.9"/>
      </svg>
    </span>
  );
}

/* icons */
export function DialIcon({ on }) { return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2.2 : 1.9}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M12 3v3M21 12h-3M12 21v-3M3 12h3" strokeLinecap="round"/></svg>; }
export function ListIcon({ on }) { return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2.2 : 1.9} strokeLinecap="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none"/></svg>; }
export function BeanIcon({ on }) { return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2.2 : 1.9}><ellipse cx="12" cy="12" rx="7.5" ry="9.5"/><path d="M12 3C8.5 7 8.5 17 12 21" strokeLinecap="round"/></svg>; }
export function CupIcon({ on }) { return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2.2 : 1.9} strokeLinejoin="round"><path d="M6 4h12l-1.3 15a2 2 0 0 1-2 1.8H9.3a2 2 0 0 1-2-1.8z"/><path d="M6.6 10h10.8" strokeLinecap="round"/></svg>; }
export function Chev() { return <svg width="9" height="15" viewBox="0 0 9 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M7 1L1.5 7.5 7 14"/></svg>; }
export function Plus() { return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M9 2v14M2 9h14"/></svg>; }
export function Dots3() { return <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor"><circle cx="2" cy="2" r="2"/><circle cx="2" cy="8" r="2"/><circle cx="2" cy="14" r="2"/></svg>; }
export function TrashIcon({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6"/></svg>; }
export function EditIcon({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 5.5l4 4M4.5 19.5l1.2-4L16 5.2a2.05 2.05 0 0 1 2.9 2.9L8.5 18.3z"/></svg>; }

/* Shared bottom sheet (overlay slides up within the app column). */
export function Sheet({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(42,33,26,0.42)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backdropFilter: 'blur(2px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, borderRadius: '24px 24px 0 0',
        padding: '10px 20px calc(30px + env(safe-area-inset-bottom, 0px))', maxHeight: '90%', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.line, margin: '4px auto 16px' }} />
        {children}
      </div>
    </div>
  );
}

/* Branded full-screen splash shown while the first sync is in flight. */
export function Splash({ label = '同步中…' }) {
  return (
    <div className="cd-app" style={{
      position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% 30%, #efe6d6, #e3d6c0)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <svg className="cd-spin" width="46" height="46" viewBox="0 0 46 46" fill="none">
        <circle cx="23" cy="23" r="19" stroke={C.line} strokeWidth="4" />
        <path d="M23 4a19 19 0 0 1 19 19" stroke={C.caramel} strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: C.cocoa }}>{label}</div>
    </div>
  );
}

/* In-app confirm dialog (warm-styled, replaces window.confirm). Renders inside
   the phone frame via position:absolute. */
export function Confirm({ title, message, confirmLabel = '删除', onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(42,33,26,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, backdropFilter: 'blur(2px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.paper, borderRadius: 20, padding: '22px 22px 18px',
        width: '100%', maxWidth: 300, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: C.ink }}>{title}</div>
        {message && <div style={{ fontSize: 13.5, color: C.cocoa, marginTop: 8, lineHeight: 1.5 }}>{message}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: 13, background: 'transparent',
            border: `1px solid ${C.line}`, color: C.cocoa, fontSize: 14.5, fontWeight: 600 }}>取消</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: 13, background: '#b04a35',
            color: '#fff', fontSize: 14.5, fontWeight: 600 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
