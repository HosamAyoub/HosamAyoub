// Builds profile/stats-dark.svg and profile/stats-light.svg: one impact figure from the CV plus live GitHub figures.
// Runs in the readme-cards workflow with GITHUB_TOKEN; no dependencies.
import { mkdirSync, writeFileSync } from 'node:fs';

const login = process.env.GH_LOGIN || 'HosamAyoub';
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN is not set');

async function gql(query) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const base = await gql(`{ user(login: "${login}") {
  createdAt
  repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
    totalCount nodes { languages(first: 20) { nodes { name } } }
  }
} }`);
const since = new Date(base.user.createdAt).getUTCFullYear();
const thisYear = new Date().getUTCFullYear();

let contributions = 0;
let commits = 0;
for (let y = since; y <= thisYear; y++) {
  const d = await gql(`{ user(login: "${login}") { contributionsCollection(
    from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") {
      totalCommitContributions contributionCalendar { totalContributions } } } }`);
  const c = d.user.contributionsCollection;
  contributions += c.contributionCalendar.totalContributions;
  commits += c.totalCommitContributions;
}
const repos = base.user.repositories.totalCount;
// languages written by hand across public repos; markup, build files and framework scaffolding
// (Java / Objective-C from Flutter templates) are not counted
const NOT_WRITTEN = new Set(['HTML', 'CSS', 'Makefile', 'CMake', 'Batchfile', 'Linker Script', 'Dockerfile', 'Java', 'Objective-C', 'Swift', 'Kotlin']);
const languages = new Set(base.user.repositories.nodes.flatMap((r) => r.languages.nodes.map((l) => l.name)).filter((n) => !NOT_WRITTEN.has(n)));
const fmt = (n) => n.toLocaleString('en-US');

const tiles = [
  { value: '15x', lines: ['lower operating cost on a', 'production AI pipeline'] },
  { value: fmt(contributions), lines: ['GitHub contributions', `since ${since}`] },
  { value: fmt(commits), lines: ['public commits across', `${repos} repositories`] },
  { value: String(languages.size), lines: ['programming languages,', 'from Assembly to TypeScript'] },
];

// the card is transparent (outlines only), so it ships in two colour sets and the README picks one per GitHub theme
const THEMES = {
  dark: { title: '#3fb950', border: '#23406b', label: '#9fb3cc', num: ['#ffffff', '#9cc3ff'] },
  light: { title: '#1a7f37', border: '#d0d7de', label: '#59636e', num: ['#1f2328', '#0969da'] },
};

const W = 264, GAP = 24, X0 = 36, Y0 = 70;
mkdirSync('profile', { recursive: true });
for (const [theme, c] of Object.entries(THEMES)) {
  const tileSvg = tiles.map((t, i) => {
    const x = X0 + i * (W + GAP);
    return `
  <g transform="translate(${x} ${Y0})">
    <rect width="${W}" height="124" rx="12" fill="none" stroke="${c.border}" stroke-width="1.5"/>
    <text x="24" y="56" class="sans num">${t.value}</text>
    ${t.lines.map((l, j) => `<text x="24" y="${86 + j * 22}" class="sans label">${l}</text>`).join('\n    ')}
  </g>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="226" viewBox="0 0 1200 226" role="img" aria-label="By the numbers: ${tiles.map((t) => `${t.value} ${t.lines.join(' ')}`).join('; ')}">
  <defs>
    <linearGradient id="num" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${c.num[0]}"/><stop offset="1" stop-color="${c.num[1]}"/>
    </linearGradient>
  </defs>
  <style>
    .sans { font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif; }
    .mono { font-family: 'Cascadia Code', 'Fira Code', Consolas, 'SFMono-Regular', Menlo, monospace; }
    .num { font-size: 46px; font-weight: 700; fill: url(#num); }
    .label { font-size: 18px; fill: ${c.label}; }
  </style>
  <text x="36" y="46" class="mono" font-size="16" letter-spacing="3" fill="${c.title}">BY THE NUMBERS</text>${tileSvg}
</svg>
`;
  writeFileSync(`profile/stats-${theme}.svg`, svg);
}
console.log({ contributions, commits, repos, since, languages: [...languages].sort() });
