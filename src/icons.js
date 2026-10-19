const paths = {
  clients: '<circle cx="12" cy="8" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
  assets: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M7 7h10M7 17h10M9 12h6"/>',
  documents: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/>',
  history: '<path d="M4 12a8 8 0 1 0 2-5M4 3v5h5M12 8v5l3 2"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  diagonal: '<path d="M7 17 17 7M7 7h10v10"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  link: '<path d="m9 15 6-6M8 8l-2 2a4 4 0 0 0 6 6l1-1M16 16l2-2a4 4 0 0 0-6-6l-1 1"/>',
  chat: '<path d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-4-.9L3 20l1.5-4.5a8 8 0 1 1 15.5-4Z"/><path d="M8 9h8M8 13h5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
};
export function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.documents}</svg>`;
}
