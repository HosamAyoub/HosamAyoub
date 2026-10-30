// Generates assets/tech-stack.svg. Run from the repo root: node .github/scripts/build-stack.cjs
// Icons come from skillicons.dev (fetched once, embedded as data URIs so the card has no external requests);
// SQL Server, LLMs and ML have no skillicon, so they are drawn here in the same tile style.
const fs = require('fs');

const TILE_BG = '#242938';
const tile = (glyph) => `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="60" fill="${TILE_BG}"/>${glyph}</svg>`;
const custom = {
  sqlserver: tile(`<g fill="none" stroke="#E2453C" stroke-width="14">
    <ellipse cx="128" cy="72" rx="64" ry="22"/><path d="M64 72v112c0 12 29 22 64 22s64-10 64-22V72"/>
    <path d="M64 128c0 12 29 22 64 22s64-10 64-22"/></g>`),
  llm: tile(`<path d="M52 70a22 22 0 0 1 22-22h108a22 22 0 0 1 22 22v76a22 22 0 0 1-22 22h-60l-38 34v-34H74a22 22 0 0 1-22-22z" fill="none" stroke="#D97757" stroke-width="14" stroke-linejoin="round"/>
    <path d="M128 76l9 22 22 9-22 9-9 22-9-22-22-9 22-9z" fill="#D97757"/>`),
  ml: tile(`<g stroke="#4F9CF9" stroke-width="7" fill="none">
    <path d="M70 98L128 72M70 98L128 128M70 98L128 184M70 158L128 72M70 158L128 128M70 158L128 184M128 72L186 98M128 128L186 98M128 184L186 98M128 72L186 158M128 128L186 158M128 184L186 158"/></g>
    <g fill="#4F9CF9"><circle cx="70" cy="98" r="15"/><circle cx="70" cy="158" r="15"/><circle cx="128" cy="72" r="15"/><circle cx="128" cy="128" r="15"/><circle cx="128" cy="184" r="15"/><circle cx="186" cy="98" r="15"/><circle cx="186" cy="158" r="15"/></g>`),
};

const panels = [
  { title: 'Backend', color: '#4fa3f0', icons: [['cs', 'C#'], ['dotnet', '.NET'], ['sqlserver', 'SQL Server'], ['elasticsearch', 'Elasticsearch']],
    tags: 'ASP.NET Core · Web API · Entity Framework · LINQ · REST · JWT' },
  { title: 'Frontend', color: '#5fd0a8', icons: [['angular', 'Angular'], ['ts', 'TypeScript'], ['js', 'JavaScript'], ['vue', 'Vue'], ['html', 'HTML'], ['css', 'CSS'], ['bootstrap', 'Bootstrap']],
    tags: 'Responsive UI · Google Maps API · AI chatbot UI' },
  { title: 'AI & automation', color: '#3b82f6', icons: [['py', 'Python'], ['llm', 'LLMs'], ['ml', 'ML models']],
    tags: 'Production AI pipelines · agentic workflows · AI chatbots' },
  { title: 'Systems & embedded', color: '#7ee787', icons: [['c', 'C'], ['cpp', 'C++'], ['linux', 'Linux'], ['bash', 'Bash'], ['raspberrypi', 'Raspberry Pi'], ['git', 'Git'], ['github', 'GitHub']],
    tags: 'STM32 · RTOS · Yocto · bootloaders · UART / SPI / I2C / CAN' },
];

const esc = (s) => s.replace(/&/g, "&amp;");
const b64 = (s) => Buffer.from(s).toString('base64');
async function iconData(id) {
  if (custom[id]) return b64(custom[id]);
  const res = await fetch(`https://skillicons.dev/icons?i=${id}&theme=dark`);
  if (!res.ok) throw new Error(`skillicons ${id}: ${res.status}`);
  return b64(await res.text());
}

(async () => {
  const W = 1200, PAD = 36, GAP = 24, PW = (W - 2 * PAD - GAP) / 2, PH = 196, TOP = 70;
  const ICON = 48, STEP = 74;
  const H = TOP + 2 * PH + GAP + 30;
  let body = '';
  for (const [i, p] of panels.entries()) {
    const x = PAD + (i % 2) * (PW + GAP), y = TOP + Math.floor(i / 2) * (PH + GAP);
    body += `
  <g transform="translate(${x} ${y})">
    <rect width="${PW}" height="${PH}" rx="12" fill="#111c2e" stroke="#23406b" stroke-width="1.5"/>
    <circle cx="28" cy="34" r="5" fill="${p.color}"/>
    <text x="42" y="40" class="sans head">${esc(p.title)}</text>`;
    for (const [j, [id, label]] of p.icons.entries()) {
      const ix = 24 + j * (p.icons.length <= 4 ? 104 : STEP);
      body += `
    <image x="${ix}" y="62" width="${ICON}" height="${ICON}" href="data:image/svg+xml;base64,${await iconData(id)}"/>
    <text x="${ix + ICON / 2}" y="130" text-anchor="middle" class="sans label">${label}</text>`;
    }
    body += `
    <text x="24" y="170" class="sans tags">${p.tags}</text>
  </g>`;
  }

  const all = panels.map((p) => `${p.title}: ${p.icons.map((ic) => ic[1]).join(', ')}; ${p.tags.replace(/ · /g, ', ')}`).join('. ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tech stack. ${esc(all)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d1117"/><stop offset="0.55" stop-color="#0f1b30"/><stop offset="1" stop-color="#132a4a"/>
    </linearGradient>
  </defs>
  <style>
    .sans { font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif; }
    .mono { font-family: 'Cascadia Code', 'Fira Code', Consolas, 'SFMono-Regular', Menlo, monospace; }
    .head { font-size: 20px; font-weight: 600; fill: #e6edf3; }
    .label { font-size: 13px; fill: #9fb3cc; }
    .tags { font-size: 14px; fill: #7d93b0; }
  </style>
  <rect width="${W}" height="${H}" rx="18" fill="url(#bg)"/>
  <text x="${PAD}" y="46" class="mono" font-size="16" letter-spacing="3" fill="#7ee787">TECH STACK</text>${body}
</svg>
`;
  fs.writeFileSync('assets/tech-stack.svg', svg);
  console.log('ok', svg.length);
})();
