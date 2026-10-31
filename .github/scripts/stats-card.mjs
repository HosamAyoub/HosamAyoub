// Builds profile/stats.svg: two impact figures from the CV plus live GitHub figures.
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
  repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) { totalCount }
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
const fmt = (n) => n.toLocaleString('en-US');

const tiles = [
  { value: '15x', lines: ['lower operating cost on a', 'production AI pipeline'] },
  { value: fmt(contributions), lines: ['GitHub contributions', `since ${since}`] },
  { value: fmt(commits), lines: ['public commits across', `${repos} repositories`] },
  { value: '1st', lines: ['in department for the', 'SOVA graduation project'] },
];

const W = 264, GAP = 24, X0 = 36, Y0 = 70;
const tileSvg = tiles.map((t, i) => {
  const x = X0 + i * (W + GAP);
  return `
  <g transform="translate(${x} ${Y0})">
    <rect width="${W}" height="124" rx="12" fill="#111c2e" stroke="#23406b" stroke-width="1.5"/>
    <text x="24" y="56" class="sans num">${t.value}</text>
    ${t.lines.map((l, j) => `<text x="24" y="${86 + j * 22}" class="sans label">${l}</text>`).join('\n    ')}
  </g>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="226" viewBox="0 0 1200 226" role="img" aria-label="By the numbers: ${tiles.map((t) => `${t.value} ${t.lines.join(' ')}`).join('; ')}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d1117"/><stop offset="0.55" stop-color="#0f1b30"/><stop offset="1" stop-color="#132a4a"/>
    </linearGradient>
    <linearGradient id="num" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9cc3ff"/>
    </linearGradient>
  </defs>
  <style>
    .sans { font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif; }
    .mono { font-family: 'Cascadia Code', 'Fira Code', Consolas, 'SFMono-Regular', Menlo, monospace; }
    .num { font-size: 46px; font-weight: 700; fill: url(#num); }
    .label { font-size: 18px; fill: #9fb3cc; }
  </style>
  <rect width="1200" height="226" rx="18" fill="url(#bg)"/>
  <text x="36" y="46" class="mono" font-size="16" letter-spacing="3" fill="#7ee787">BY THE NUMBERS</text>
  <text x="1164" y="46" text-anchor="end" class="mono" font-size="14" fill="#5b7aa6">GitHub figures refresh daily</text>${tileSvg}
</svg>
`;

mkdirSync('profile', { recursive: true });
writeFileSync('profile/stats.svg', svg);
console.log({ contributions, commits, repos, since });
