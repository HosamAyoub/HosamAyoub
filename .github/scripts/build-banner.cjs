// Generates assets/banner.svg (timeline banner, SMIL-timed loader). Run from the repo root: node .github/scripts/build-banner.cjs
const fs = require('fs');
// Timing in seconds. Stops finish at 1, 3, 5 and 7 s (on the 1 s pulse beat); after the last one
// all four pulse together FINAL times in total, then everything resets.
const SEC = 9, FINAL = 2, BEAT = 1, PULSE = 0.65;
const DUR = SEC + 's';
const k = (t) => +(t / SEC).toFixed(4);
const DARK = '#0d1117';
const FILL = process.env.FILL || 'solid';
const OUT = process.env.OUT || 'assets/banner.svg';

// hold windows (fraction of the cycle) while the loader sits inside each stop
const stops = [
  { x: 170, c: '#7ee787', a: k(0.5), b: k(1), year: '2021', title: 'Embedded C', sub: 'microcontroller drivers' },
  { x: 450, c: '#5fd0a8', a: k(2.5), b: k(3), year: '2023', title: 'Embedded Linux + ML', sub: 'SOVA smart glasses, 1st in dept.' },
  { x: 730, c: '#4fa3f0', a: k(4.5), b: k(5), year: '2025', title: 'Full-Stack .NET', sub: 'C#, SQL Server, Angular' },
  { x: 1010, c: '#3b82f6', a: k(6.5), b: k(7), year: 'TODAY', title: 'Production AI pipeline', sub: 'Software Engineer @ Z2Data' },
];

// icon drawings; `col` is the stroke/fill colour, `live` adds the neuron blink
const icons = [
  (col) => `<g class="icon" stroke="${col}">
      <rect x="160" y="190" width="20" height="20" rx="3"/>
      <path d="M165 186v4M170 186v4M175 186v4M165 210v4M170 210v4M175 210v4M156 195h4M156 205h4M180 195h4M180 205h4"/>
    </g>`,
  (col) => `<g class="icon" stroke="${col}">
      <circle cx="441" cy="203" r="6"/><circle cx="459" cy="203" r="6"/>
      <path d="M447 203h6M435 203l-3-6M465 203l3-6"/>
    </g>`,
  (col) => `<g class="icon" stroke="${col}">
      <path d="M721 193l-7 7 7 7M739 193l7 7-7 7M733 190l-6 20"/>
    </g>`,
  (col, live) => {
    const n = (cls, cx, cy) => `<circle${live ? ` class="neuron${cls}"` : ''} cx="${cx}" cy="${cy}" r="2.8" fill="${col}"/>`;
    return `<g fill="none" stroke="${live ? '#3a6db0' : col}" stroke-width="1">
      <path d="M996 193L1010 187M996 193L1010 200M996 193L1010 213M996 207L1010 187M996 207L1010 200M996 207L1010 213"/>
      <path d="M1010 187L1024 193M1010 200L1024 193M1010 213L1024 193M1010 187L1024 207M1010 200L1024 207M1010 213L1024 207"/>
    </g>
    ${n('', 996, 193)}${n(' d1', 996, 207)}
    ${n(' d2', 1010, 187)}${n(' d3', 1010, 200)}${n(' d4', 1010, 213)}
    ${n(' d1', 1024, 193)}${n(' d3', 1024, 207)}`;
  },
];

// loader path: travel, hold inside each stop, travel on; fade out after TODAY
const pos = [110, ...stops.flatMap((s) => [s.x, s.x])];
const times = [0, ...stops.flatMap((s) => [s.a, s.b])];
pos.push(1010); times.push(1);
const loader = `<g>
    <animateTransform attributeName="transform" type="translate" dur="${DUR}" repeatCount="indefinite"
      values="${pos.map((p) => `${p} 0`).join(';')}" keyTimes="${times.join(';')}"/>
    <animate attributeName="opacity" dur="${DUR}" repeatCount="indefinite" values="0;1;1;0;0" keyTimes="0;${k(0.15)};${k(7)};${k(7.3)};1"/>
    <rect x="-22" y="198" width="44" height="4" rx="2" fill="#ffffff" opacity=".9"/>
  </g>`;

const clips = stops.map((s, i) => `<clipPath id="fill${i}">
      <rect x="${s.x - 26}" y="174" width="0" height="52">
        <animate attributeName="width" dur="${DUR}" repeatCount="indefinite" values="0;0;52;52" keyTimes="0;${s.a};${s.b};1"/>
      </rect>
    </clipPath>`).join('\n    ');

const pulses = (s) => {
  const P = k(BEAT), L = k(PULSE), last = k(7 + (FINAL - 1) * BEAT), f = (n) => +n.toFixed(4);
  const starts = [];
  for (let t = s.b; t <= last + 1e-6; t += P) starts.push(t);
  const rk = [0], rv = [26], ok = [0], ov = [0];
  for (const t of starts) {
    rk.push(f(t), f(t + L)); rv.push(26, 46);
    ok.push(f(t), f(t + 0.002), f(t + L)); ov.push(0, 0.9, 0);
  }
  if (rk[rk.length - 1] < 1) { rk.push(1); rv.push(46); }
  if (ok[ok.length - 1] < 1) { ok.push(1); ov.push(0); }
  return `<circle cx="${s.x}" cy="200" r="26" fill="none" stroke="${s.c}" stroke-width="2.5" opacity="0">
      <animate attributeName="r" dur="${DUR}" repeatCount="indefinite" values="${rv.join(';')}" keyTimes="${rk.join(';')}"/>
      <animate attributeName="opacity" dur="${DUR}" repeatCount="indefinite" values="${ov.join(';')}" keyTimes="${ok.join(';')}"/>
    </circle>`;
};

const stopSvg = stops.map((s, i) => `
  <!-- ${s.year}: ${s.title} -->
  <g>
    <text x="${s.x}" y="160" text-anchor="middle" class="mono year" fill="${s.c}">${s.year}</text>
    ${pulses(s)}
    <circle class="node" cx="${s.x}" cy="200" r="26" stroke="${s.c}"/>
    ${icons[i](s.c, true)}
    <g clip-path="url(#fill${i})">
      <animate attributeName="opacity" dur="${DUR}" repeatCount="indefinite" values="1;1;0" keyTimes="0;${k(7 + (FINAL - 1) * BEAT + PULSE + 0.05)};1"/>
      <circle cx="${s.x}" cy="200" r="24.7" fill="${s.c}" opacity="${FILL === 'tint' ? 0.35 : 1}"/>
      ${icons[i](FILL === 'tint' ? s.c : DARK, false)}
    </g>
    <text x="${s.x}" y="252" text-anchor="middle" class="sans title">${s.title}</text>
    <text x="${s.x}" y="274" text-anchor="middle" class="sans sub">${s.sub}</text>
  </g>`).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="320" viewBox="0 0 1200 320" role="img" aria-label="Hosam Ayoub, software engineer who loves building solutions. 2021 embedded C and microcontroller drivers, 2023 embedded Linux with SOVA, 2025 full-stack .NET, today an AI pipeline in production at Z2Data.">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d1117"/>
      <stop offset="0.55" stop-color="#0f1b30"/>
      <stop offset="1" stop-color="#132a4a"/>
    </linearGradient>
    <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#9cc3ff"/>
    </linearGradient>
    <linearGradient id="time" gradientUnits="userSpaceOnUse" x1="110" y1="0" x2="1090" y2="0">
      <stop offset="0" stop-color="#7ee787"/>
      <stop offset="1" stop-color="#3b82f6"/>
    </linearGradient>
    ${clips}
  </defs>

  <style>
    .sans { font-family: 'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif; }
    .mono { font-family: 'Cascadia Code', 'Fira Code', Consolas, 'SFMono-Regular', Menlo, monospace; }
    .year { font-size: 15px; letter-spacing: 2px; }
    .title { font-size: 18px; font-weight: 600; fill: #e6edf3; }
    .sub { font-size: 14px; fill: #8ea5c2; }
    .node { fill: #111c2e; stroke-width: 2.5; }
    .icon { fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .neuron { animation: blink 3s ease-in-out infinite; }
    .neuron.d1 { animation-delay: .4s; } .neuron.d2 { animation-delay: .8s; }
    .neuron.d3 { animation-delay: 1.2s; } .neuron.d4 { animation-delay: 1.6s; }
    @keyframes blink { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .neuron { animation: none; } }
  </style>

  <rect width="1200" height="320" rx="18" fill="url(#bg)"/>

  <!-- identity -->
  <text x="600" y="78" text-anchor="middle" class="sans" font-size="56" font-weight="700" fill="url(#name)" letter-spacing="1">Hosam Ayoub</text>
  <text x="600" y="114" text-anchor="middle" class="sans" font-size="21" fill="#c9d7ea">Software engineer who loves building solutions</text>

  <!-- the time line and its loader: each stop fills white left to right while the loader is inside it -->
  <line x1="110" y1="200" x2="1090" y2="200" stroke="url(#time)" stroke-width="3" opacity=".55"/>
  ${loader}
${stopSvg}
</svg>
`;

fs.writeFileSync(OUT, svg);
console.log('ok', svg.length);
