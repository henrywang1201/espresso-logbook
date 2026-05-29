// espresso-logbook app shell — state, navigation, screen switching.
import { useState } from 'react';
import { DeviceFrame, SBar, BottomNav } from './components/frame.jsx';
import { RecordScreen } from './components/RecordScreen.jsx';
import { RecipesScreen } from './components/RecipesScreen.jsx';
import { HistoryScreen } from './components/HistoryScreen.jsx';
import { BeansScreen } from './components/BeansScreen.jsx';
import {
  BEANS_SEED, BREWS_SEED, DRINKS_SEED, load, save,
} from './data.js';

export default function App() {
  const [beans] = useState(() => load('cd_beans', BEANS_SEED));
  const [brews, setBrews] = useState(() => load('cd_brews', BREWS_SEED));
  const [drinks, setDrinks] = useState(() => load('cd_drinks', DRINKS_SEED));
  const [currentBean, setCurrentBean] = useState(beans[3] || beans[0]);
  const [tab, setTab] = useState('record');

  const addBrew = (data) => {
    const entry = { id: 'b' + Date.now(), date: '刚刚', tags: [], ...data };
    const next = [entry, ...brews];
    setBrews(next);
    save('cd_brews', next);
  };

  const addDrink = (d) => {
    const next = [...drinks, d];
    setDrinks(next);
    save('cd_drinks', next);
  };

  return (
    <DeviceFrame>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }} className="cd-app">
        <SBar />
        <div key={tab} className="cd-screen" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {tab === 'record' && <RecordScreen beans={beans} currentBean={currentBean} setCurrentBean={setCurrentBean} onSave={addBrew} />}
          {tab === 'recipes' && <RecipesScreen drinks={drinks} addDrink={addDrink} />}
          {tab === 'history' && <HistoryScreen beans={beans} brews={brews} />}
          {tab === 'beans' && <BeansScreen beans={beans} brews={brews} currentBean={currentBean} setCurrentBean={setCurrentBean} setTab={setTab} />}
        </div>
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </DeviceFrame>
  );
}
