// espresso-logbook app shell — shared cloud data (Supabase) + realtime sync.
import { useState, useEffect } from 'react';
import { AppShell, BottomNav, Splash } from './components/frame.jsx';
import { RecordScreen } from './components/RecordScreen.jsx';
import { RecipesScreen } from './components/RecipesScreen.jsx';
import { HistoryScreen } from './components/HistoryScreen.jsx';
import { BeansScreen } from './components/BeansScreen.jsx';
import { C } from './theme.js';
import { BEANS_SEED, BREWS_SEED, DRINKS_SEED } from './data.js';
import { isConfigured, supabase } from './supabase.js';
import {
  fetchBeans, fetchBrews, fetchDrinks,
  createBrew, deleteBrew, createDrink, deleteDrink, deleteBean,
} from './api.js';

function pickDefaultBean(beans) { return beans.find((b) => b.id === 'house') || beans[0] || null; }

export default function App() {
  const [beans, setBeans] = useState([]);
  const [brews, setBrews] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [currentBean, setCurrentBean] = useState(null);
  const [tab, setTab] = useState('record');
  const [loading, setLoading] = useState(isConfigured);
  const [error, setError] = useState(null);

  /* ── initial load (or seed fallback when backend isn't configured) ── */
  useEffect(() => {
    if (!isConfigured) {
      setBeans(BEANS_SEED); setBrews(BREWS_SEED); setDrinks(DRINKS_SEED);
      setCurrentBean(pickDefaultBean(BEANS_SEED));
      return;
    }
    let alive = true;
    (async () => {
      try {
        const [bs, brs, drs] = await Promise.all([fetchBeans(), fetchBrews(), fetchDrinks()]);
        if (!alive) return;
        setBeans(bs); setBrews(brs); setDrinks(drs);
        setCurrentBean(pickDefaultBean(bs));
      } catch (e) {
        if (alive) setError(e?.message || String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ── realtime: any client's change refreshes everyone ── */
  useEffect(() => {
    if (!isConfigured) return;
    const channel = supabase.channel('espresso-logbook')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beans' }, async () => setBeans(await fetchBeans()))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brews' }, async () => setBrews(await fetchBrews()))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drinks' }, async () => setDrinks(await fetchDrinks()))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  /* keep currentBean a valid, fresh reference as the bean list changes */
  useEffect(() => {
    if (!beans.length) { setCurrentBean(null); return; }
    setCurrentBean((cur) => (cur && beans.find((b) => b.id === cur.id)) || pickDefaultBean(beans));
  }, [beans]);

  /* ── mutations (no-ops in read-only fallback) ── */
  const addBrew = async (data) => {
    if (!isConfigured) return;
    try { const row = await createBrew(data); setBrews((prev) => [row, ...prev]); }
    catch (e) { setError(e?.message || String(e)); }
  };
  const onDeleteBrew = async (id) => {
    if (!isConfigured) return;
    setBrews((prev) => prev.filter((b) => b.id !== id));
    try { await deleteBrew(id); } catch (e) { setError(e?.message || String(e)); }
  };
  const addDrink = async (d) => {
    if (!isConfigured) return;
    try { const row = await createDrink(d); setDrinks((prev) => [...prev, row]); }
    catch (e) { setError(e?.message || String(e)); }
  };
  const onDeleteDrink = async (d) => {
    if (!isConfigured) return;
    setDrinks((prev) => prev.filter((x) => x.id !== d.id));
    try { await deleteDrink(d.id); } catch (e) { setError(e?.message || String(e)); }
  };
  const onDeleteBean = async (b) => {
    if (!isConfigured) return;
    setBeans((prev) => prev.filter((x) => x.id !== b.id));
    try { await deleteBean(b.id); } catch (e) { setError(e?.message || String(e)); }
  };

  if (loading) return <Splash label="同步中…" />;
  if (error) return <Splash label={'连接后端失败：' + error} />;
  if (!currentBean) return <Splash label="后端暂无数据，请先运行 schema.sql 种子" />;

  return (
    <AppShell>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }} className="cd-app">
        {!isConfigured && (
          <div style={{ flex: '0 0 auto', margin: '0 14px 6px', padding: '7px 12px', borderRadius: 10,
            background: C.cremaSoft, color: C.caramelDeep, fontSize: 11.5, fontWeight: 600, textAlign: 'center' }}>
            后端未配置 · 当前为本地只读演示数据
          </div>
        )}
        <div key={tab} className="cd-screen" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {tab === 'record' && <RecordScreen beans={beans} currentBean={currentBean} setCurrentBean={setCurrentBean} onSave={addBrew} />}
          {tab === 'recipes' && <RecipesScreen drinks={drinks} addDrink={addDrink} onDeleteDrink={onDeleteDrink} />}
          {tab === 'history' && <HistoryScreen beans={beans} brews={brews} onDeleteBrew={onDeleteBrew} />}
          {tab === 'beans' && <BeansScreen beans={beans} brews={brews} currentBean={currentBean} setCurrentBean={setCurrentBean} setTab={setTab} onDeleteBean={onDeleteBean} />}
        </div>
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </AppShell>
  );
}
