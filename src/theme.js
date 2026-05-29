// espresso-logbook — design tokens (warm cafe palette) + small shared helpers

export const C = {
  ink: '#2a211a', cocoa: '#6c5a49', taupe: '#9c8a75',
  bg: '#f1e8da', paper: '#fcf8f1', paper2: '#f5ecdd',
  line: '#e5d8c4', lineSoft: '#eee2d0',
  caramel: '#a96a39', caramelDeep: '#8a5226', crema: '#d7a86b', cremaSoft: '#ecd8b8',
  sage: '#7d8466', good: '#6f8f57', warn: '#c08334',
};

// brew ratio, e.g. 1:2.01
export function ratioOf(dose, yld) {
  if (!dose) return '—';
  return '1:' + (yld / dose).toFixed(2);
}
