// espresso-logbook — shared data (beans + brew history + drink recipes), localStorage-backed.

export const BEANS_SEED = [
  { id: 'eth', name: '耶加雪菲 · 科契尔', roaster: '晨光烘焙', roast: '浅烘', origin: '埃塞俄比亚', process: '日晒', dot: '#c98a4a',
    notes: '柑橘 · 茉莉 · 红茶', roastDate: '05-22', defDose: 18.0, defGrind: 2.2 },
  { id: 'col', name: '哥伦比亚 · 薇拉', roaster: 'Rême', roast: '中烘', origin: '哥伦比亚', process: '水洗', dot: '#9a5a2e',
    notes: '焦糖 · 红苹果 · 可可', roastDate: '05-18', defDose: 18.0, defGrind: 2.6 },
  { id: 'bra', name: '巴西 · 喜拉多', roaster: '黑标', roast: '中深烘', origin: '巴西', process: '半日晒', dot: '#6e3d1f',
    notes: '榛果 · 黑巧 · 红糖', roastDate: '05-10', defDose: 18.5, defGrind: 2.8 },
  { id: 'house', name: '意式拼配 · 晨光', roaster: '晨光烘焙', roast: '深烘', origin: '拼配', process: '—', dot: '#4a2814',
    notes: '黑巧 · 烤坚果 · 焦糖', roastDate: '05-25', defDose: 18.0, defGrind: 2.4 },
];

export const BREWS_SEED = [
  { id: 'b1', beanId: 'house', dose: 18.0, yield: 36.2, time: 28, grind: 2.4, temp: 93, score: 8,
    date: '今天 08:42', tags: ['焦糖', '黑巧', '醇厚'] },
  { id: 'b2', beanId: 'eth', dose: 18.0, yield: 38.0, time: 31, grind: 2.2, temp: 92, score: 9,
    date: '今天 07:15', tags: ['柑橘', '花香', '明亮'] },
  { id: 'b3', beanId: 'col', dose: 18.0, yield: 34.5, time: 26, grind: 2.7, temp: 93.5, score: 6,
    date: '昨天 19:30', tags: ['可可', '偏苦'] },
  { id: 'b4', beanId: 'house', dose: 18.0, yield: 36.0, time: 25, grind: 2.5, temp: 93, score: 7,
    date: '昨天 08:50', tags: ['坚果', '红糖'] },
  { id: 'b5', beanId: 'bra', dose: 18.5, yield: 37.0, time: 29, grind: 2.8, temp: 92, score: 7,
    date: '05-27 09:10', tags: ['榛果', '黑巧'] },
  { id: 'b6', beanId: 'eth', dose: 18.0, yield: 40.0, time: 33, grind: 2.1, temp: 92, score: 8,
    date: '05-26 08:05', tags: ['莓果', '红茶'] },
];

// layer types stacked bottom → top; ml are illustrative build amounts
export const LAYER_META = {
  chocolate: { label: '巧克力酱', color: '#46291a' },
  espresso:  { label: '浓缩',     color: '#37230f' },
  water:     { label: '热水',     color: '#c49a5d' },
  milk:      { label: '蒸奶',     color: '#f0e7d6' },
  foam:      { label: '奶泡',     color: '#fdfaf4' },
};

export const DRINKS_SEED = [
  { id: 'espresso',   name: '浓缩',     en: 'ESPRESSO',   cup: 60,  tag: '纯粹', preset: true,
    layers: [{ t: 'espresso', ml: 36 }], note: '18g 粉 · 36g 液 · 1:2，最纯粹的意式底。' },
  { id: 'macchiato',  name: '玛奇朵',   en: 'MACCHIATO',  cup: 80,  tag: '点缀', preset: true,
    layers: [{ t: 'espresso', ml: 36 }, { t: 'foam', ml: 15 }], note: '浓缩上点一勺奶泡「染一点」。' },
  { id: 'cortado',    name: '柯塔朵',   en: 'CORTADO',    cup: 90,  tag: '平衡', preset: true,
    layers: [{ t: 'espresso', ml: 36 }, { t: 'milk', ml: 36 }], note: '浓缩 : 蒸奶 = 1 : 1，几乎无泡。' },
  { id: 'flatwhite',  name: '馥芮白',   en: 'FLAT WHITE', cup: 160, tag: '丝滑', preset: true,
    layers: [{ t: 'espresso', ml: 36 }, { t: 'milk', ml: 120 }], note: '双份浓缩 + 细腻奶微泡，奶味更厚。' },
  { id: 'cappuccino', name: '卡布奇诺', en: 'CAPPUCCINO', cup: 180, tag: '经典', preset: true,
    layers: [{ t: 'espresso', ml: 36 }, { t: 'milk', ml: 60 }, { t: 'foam', ml: 60 }], note: '浓缩 : 奶 : 奶泡 ≈ 1 : 1 : 1。' },
  { id: 'latte',      name: '拿铁',     en: 'LATTE',      cup: 280, tag: '日常', preset: true,
    layers: [{ t: 'espresso', ml: 36 }, { t: 'milk', ml: 210 }, { t: 'foam', ml: 15 }], note: '浓缩 + 大量蒸奶 + 薄薄一层奶泡。' },
  { id: 'mocha',      name: '摩卡',     en: 'MOCHA',      cup: 300, tag: '香甜', preset: true,
    layers: [{ t: 'chocolate', ml: 30 }, { t: 'espresso', ml: 36 }, { t: 'milk', ml: 180 }, { t: 'foam', ml: 20 }], note: '巧克力打底 + 浓缩 + 蒸奶。' },
  { id: 'americano',  name: '美式',     en: 'AMERICANO',  cup: 240, tag: '清爽', preset: true,
    layers: [{ t: 'water', ml: 150 }, { t: 'espresso', ml: 36 }], note: '浓缩注入热水，保留 crema。' },
];

export function load(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return seed;
}
export function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}

export function beanById(beans, id) { return beans.find((b) => b.id === id) || beans[0]; }

// ml of a given layer type in a drink
export function layerMl(drink, type) { const l = drink.layers.find((x) => x.t === type); return l ? l.ml : 0; }
// short build summary line
export function drinkSummary(drink) {
  return drink.layers.map((l) => `${LAYER_META[l.t].label}${l.ml}`).join(' · ');
}

// avg score + count for a bean
export function beanStats(brews, beanId) {
  const rel = brews.filter((b) => b.beanId === beanId);
  if (!rel.length) return { count: 0, avg: null };
  const avg = rel.reduce((s, b) => s + b.score, 0) / rel.length;
  return { count: rel.length, avg };
}
