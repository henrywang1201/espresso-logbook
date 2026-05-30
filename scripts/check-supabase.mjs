// One-off connectivity check: reads .env.local and counts rows in each table.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=')).map((l) => {
      const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

for (const t of ['beans', 'brews', 'drinks']) {
  const { data, error, count } = await sb.from(t).select('*', { count: 'exact' });
  if (error) console.log(`✗ ${t}: ${error.message}`);
  else console.log(`✓ ${t}: ${count} rows`);
}

// quick write+delete round-trip to confirm open RLS allows mutations
const probe = { id: 'probe' + Date.now(), name: '连接测试', preset: false, layers: [{ t: 'espresso', ml: 36 }], note: 'x' };
const ins = await sb.from('drinks').insert(probe).select().single();
console.log(ins.error ? `✗ insert: ${ins.error.message}` : '✓ insert OK');
if (!ins.error) {
  const del = await sb.from('drinks').delete().eq('id', probe.id);
  console.log(del.error ? `✗ delete: ${del.error.message}` : '✓ delete OK');
}
