-- ============================================================================
-- espresso-logbook — Supabase schema
-- 在 Supabase 控制台 → SQL Editor 里整段运行一次即可。
-- 作用：建 3 张表（豆子/冲煮/配方）、对匿名角色完全开放读写、开启实时、灌入种子数据。
-- 注意：列名用引号 camelCase，与前端 JS 对象字段一一对应，前端无需任何字段映射。
-- ============================================================================

-- 干净重建（如需保留旧数据，去掉下面三行 drop）
drop table if exists brews cascade;
drop table if exists beans cascade;
drop table if exists drinks cascade;

-- ── 豆子库 ──────────────────────────────────────────────────────────────────
create table beans (
  id          text primary key,
  name        text not null,
  roaster     text,
  origin      text,
  roast       text,
  process     text,
  dot         text,
  notes       text,
  "roastDate" text,
  "defDose"   numeric,
  "defGrind"  numeric,
  created_at  timestamptz not null default now()
);

-- ── 冲煮记录 ────────────────────────────────────────────────────────────────
create table brews (
  id         text primary key,
  "beanId"   text references beans(id) on delete set null,
  dose       numeric,
  "yield"    numeric,
  time       integer,
  grind      numeric,
  temp       numeric,
  score      integer,
  date       text,
  tags       jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index brews_created_idx on brews (created_at desc);

-- ── 配方小抄 ────────────────────────────────────────────────────────────────
create table drinks (
  id         text primary key,
  name       text not null,
  en         text,
  cup        integer,
  tag        text,
  preset     boolean not null default false,
  layers     jsonb not null default '[]'::jsonb,
  note       text,
  created_at timestamptz not null default now()
);

-- ── 行级安全：完全开放（任何人可增删改查） ─────────────────────────────────────
-- anon key 随前端公开，靠下面的策略放行匿名角色的全部操作。
alter table beans  enable row level security;
alter table brews  enable row level security;
alter table drinks enable row level security;

create policy "public all on beans"  on beans  for all using (true) with check (true);
create policy "public all on brews"  on brews  for all using (true) with check (true);
create policy "public all on drinks" on drinks for all using (true) with check (true);

-- ── 实时：让任意客户端的改动实时推送到所有人 ───────────────────────────────────
alter publication supabase_realtime add table beans;
alter publication supabase_realtime add table brews;
alter publication supabase_realtime add table drinks;

-- ── 种子数据（与前端 src/data.js 的 *_SEED 一致；已存在则跳过） ──────────────────
insert into beans (id, name, roaster, roast, origin, process, dot, notes, "roastDate", "defDose", "defGrind") values
  ('eth',   '耶加雪菲 · 科契尔', '晨光烘焙', '浅烘',   '埃塞俄比亚', '日晒',  '#c98a4a', '柑橘 · 茉莉 · 红茶',  '05-22', 18.0, 2.2),
  ('col',   '哥伦比亚 · 薇拉',   'Rême',     '中烘',   '哥伦比亚',   '水洗',  '#9a5a2e', '焦糖 · 红苹果 · 可可', '05-18', 18.0, 2.6),
  ('bra',   '巴西 · 喜拉多',     '黑标',     '中深烘', '巴西',       '半日晒','#6e3d1f', '榛果 · 黑巧 · 红糖',   '05-10', 18.5, 2.8),
  ('house', '意式拼配 · 晨光',   '晨光烘焙', '深烘',   '拼配',       '—',     '#4a2814', '黑巧 · 烤坚果 · 焦糖', '05-25', 18.0, 2.4)
on conflict (id) do nothing;

insert into brews (id, "beanId", dose, "yield", time, grind, temp, score, date, tags) values
  ('b1', 'house', 18.0, 36.2, 28, 2.4, 93,   8, '今天 08:42', '["焦糖","黑巧","醇厚"]'),
  ('b2', 'eth',   18.0, 38.0, 31, 2.2, 92,   9, '今天 07:15', '["柑橘","花香","明亮"]'),
  ('b3', 'col',   18.0, 34.5, 26, 2.7, 93.5, 6, '昨天 19:30', '["可可","偏苦"]'),
  ('b4', 'house', 18.0, 36.0, 25, 2.5, 93,   7, '昨天 08:50', '["坚果","红糖"]'),
  ('b5', 'bra',   18.5, 37.0, 29, 2.8, 92,   7, '05-27 09:10', '["榛果","黑巧"]'),
  ('b6', 'eth',   18.0, 40.0, 33, 2.1, 92,   8, '05-26 08:05', '["莓果","红茶"]')
on conflict (id) do nothing;

insert into drinks (id, name, en, cup, tag, preset, layers, note) values
  ('espresso',   '浓缩',     'ESPRESSO',   60,  '纯粹', true, '[{"t":"espresso","ml":36}]', '18g 粉 · 36g 液 · 1:2，最纯粹的意式底。'),
  ('macchiato',  '玛奇朵',   'MACCHIATO',  80,  '点缀', true, '[{"t":"espresso","ml":36},{"t":"foam","ml":15}]', '浓缩上点一勺奶泡「染一点」。'),
  ('cortado',    '柯塔朵',   'CORTADO',    90,  '平衡', true, '[{"t":"espresso","ml":36},{"t":"milk","ml":36}]', '浓缩 : 蒸奶 = 1 : 1，几乎无泡。'),
  ('flatwhite',  '馥芮白',   'FLAT WHITE', 160, '丝滑', true, '[{"t":"espresso","ml":36},{"t":"milk","ml":120}]', '双份浓缩 + 细腻奶微泡，奶味更厚。'),
  ('cappuccino', '卡布奇诺', 'CAPPUCCINO', 180, '经典', true, '[{"t":"espresso","ml":36},{"t":"milk","ml":60},{"t":"foam","ml":60}]', '浓缩 : 奶 : 奶泡 ≈ 1 : 1 : 1。'),
  ('latte',      '拿铁',     'LATTE',      280, '日常', true, '[{"t":"espresso","ml":36},{"t":"milk","ml":210},{"t":"foam","ml":15}]', '浓缩 + 大量蒸奶 + 薄薄一层奶泡。'),
  ('mocha',      '摩卡',     'MOCHA',      300, '香甜', true, '[{"t":"chocolate","ml":30},{"t":"espresso","ml":36},{"t":"milk","ml":180},{"t":"foam","ml":20}]', '巧克力打底 + 浓缩 + 蒸奶。'),
  ('americano',  '美式',     'AMERICANO',  240, '清爽', true, '[{"t":"water","ml":150},{"t":"espresso","ml":36}]', '浓缩注入热水，保留 crema。')
on conflict (id) do nothing;
