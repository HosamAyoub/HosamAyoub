// Generates the contact pills under the banner: assets/contact-{linkedin,email,location}-{dark,light}.svg.
// Run from the repo root: node .github/scripts/build-contact.cjs
// One SVG per pill because each one needs its own link; outline-only like the cards, in a dark and a light set.
const fs = require('fs');

const ICONS = {
  linkedin: (c) => `<path transform="translate(16 10) scale(.75)" fill="${c}" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.064 2.064 0 1 1 0-4.128 2.064 2.064 0 0 1 0 4.128zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>`,
  email: (c) => `<g transform="translate(16 10) scale(.75)" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"><path d="M2 5h20v14H2z M2 5l10 8 10-8"/></g>`,
  location: (c) => `<path transform="translate(16 9) scale(.78)" fill="${c}" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>`,
};
const pills = [
  { id: 'linkedin', label: 'LinkedIn', value: 'hosamayoub' },
  { id: 'email', label: 'Email', value: 'hosamayoub50@gmail.com' },
  { id: 'location', label: 'Based in', value: 'Cairo, Egypt' },
];
const THEMES = {
  dark: { stroke: '#23406b', text: '#e6edf3', sub: '#9fb3cc', icon: '#58a6ff' },
  light: { stroke: '#d0d7de', text: '#1f2328', sub: '#59636e', icon: '#0969da' },
};

for (const [theme, c] of Object.entries(THEMES)) {
  for (const p of pills) {
    const w = Math.round(52 + (p.label.length + p.value.length) * 7.6 + 18);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="38" viewBox="0 0 ${w} 38" role="img" aria-label="${p.label}: ${p.value}">
  <rect x="1" y="1" width="${w - 2}" height="36" rx="18" fill="none" stroke="${c.stroke}" stroke-width="1.5"/>
  ${ICONS[p.id](c.icon)}
  <text x="44" y="24" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif" font-size="14"><tspan fill="${c.sub}">${p.label}</tspan><tspan fill="${c.text}" font-weight="600" dx="6">${p.value}</tspan></text>
</svg>
`;
    fs.writeFileSync(`assets/contact-${p.id}-${theme}.svg`, svg);
  }
}
console.log('ok');
