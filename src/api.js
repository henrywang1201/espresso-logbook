// Data access layer over Supabase. Column names mirror the JS object keys
// exactly (see supabase/schema.sql), so rows need no transformation.
import { supabase } from './supabase.js';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

/* ── reads ── */
export async function fetchBeans() {
  return unwrap(await supabase.from('beans').select('*').order('created_at', { ascending: true }));
}
export async function fetchBrews() {
  return unwrap(await supabase.from('brews').select('*').order('created_at', { ascending: false }));
}
export async function fetchDrinks() {
  return unwrap(await supabase.from('drinks').select('*').order('created_at', { ascending: true }));
}

/* ── brews ── */
export async function createBrew(brew) {
  const row = { id: 'b' + Date.now(), date: '刚刚', tags: [], ...brew };
  return unwrap(await supabase.from('brews').insert(row).select().single());
}
export async function deleteBrew(id) {
  const { error } = await supabase.from('brews').delete().eq('id', id);
  if (error) throw error;
}
export async function updateBrew(id, patch) {
  return unwrap(await supabase.from('brews').update(patch).eq('id', id).select().single());
}

/* ── drinks ── */
export async function createDrink(drink) {
  return unwrap(await supabase.from('drinks').insert(drink).select().single());
}
export async function deleteDrink(id) {
  const { error } = await supabase.from('drinks').delete().eq('id', id);
  if (error) throw error;
}

/* ── beans ── */
export async function createBean(bean) {
  const row = { id: 'bean' + Date.now(), ...bean };
  return unwrap(await supabase.from('beans').insert(row).select().single());
}
export async function updateBean(id, patch) {
  return unwrap(await supabase.from('beans').update(patch).eq('id', id).select().single());
}
export async function deleteBean(id) {
  const { error } = await supabase.from('beans').delete().eq('id', id);
  if (error) throw error;
}
