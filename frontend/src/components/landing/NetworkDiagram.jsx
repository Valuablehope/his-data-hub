import React from 'react';

const SOURCES = [
  { id: 'coord', x: 130, y: 90, label: 'Coordination Office' },
  { id: 'saida', x: 130, y: 270, label: 'Saida Base' },
  { id: 'tripoli', x: 130, y: 450, label: 'Tripoli Base' },
];

const HUB = { id: 'hub', x: 570, y: 270, label: 'HIS Data Hub' };

const MODULES = [
  { id: 'sops', x: 1010, y: 40, label: 'SOPs', color: '#DF0A20' },
  { id: 'flows', x: 1010, y: 155, label: 'Flows', color: '#DF0A20' },
  { id: 'facilities', x: 1010, y: 270, label: 'Facilities', color: '#60a5fa' },
  { id: 'files', x: 1010, y: 385, label: 'Files', color: '#fbbf24' },
  { id: 'links', x: 1010, y: 500, label: 'Project Links', color: '#94a3b8' },
];

function Edge({ x1, y1, x2, y2, variant, delay }) {
  // A gentle S-curve reads as "data flow" better than a straight line at this aspect ratio.
  const midX = (x1 + x2) / 2;
  const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  return (
    <path
      d={d}
      className={`hub-edge hub-edge--${variant}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function Node({ x, y, label, r, coreR, color, tag }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} className="hub-node-ring" style={{ stroke: color }} />
      <circle cx={x} cy={y} r={coreR} className="hub-node-core" style={{ fill: color }} />
      <text x={x} y={y + r + 22} textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="700" fontFamily="var(--font-sans)">
        {label}
      </text>
      {tag && (
        <text x={x} y={y + r + 39} textAnchor="middle" fill={color} fontSize="10" letterSpacing="0.12em" fontFamily="var(--font-mono)" opacity="0.85">
          {tag}
        </text>
      )}
    </g>
  );
}

const NetworkDiagram = () => {
  return (
    <svg
      viewBox="0 0 1120 560"
      preserveAspectRatio="xMidYMid meet"
      className="network-diagram"
      role="img"
      aria-label="Data flow diagram: the Coordination Office, Saida Base, and Tripoli Base feed the HIS Data Hub, which distributes data to the SOPs, Flows, Facilities, Files, and Project Links modules"
    >
      {SOURCES.map((s, i) => (
        <Edge key={`${s.id}-hub`} x1={s.x + 22} y1={s.y} x2={HUB.x - 40} y2={HUB.y} variant="in" delay={i * 0.35} />
      ))}
      {MODULES.map((m, i) => (
        <Edge key={`hub-${m.id}`} x1={HUB.x + 40} y1={HUB.y} x2={m.x - 22} y2={m.y} variant="out" delay={i * 0.28} />
      ))}

      {SOURCES.map(s => (
        <Node key={s.id} x={s.x} y={s.y} label={s.label} r={16} coreR={5} color="#DF0A20" tag="SOURCE" />
      ))}

      <Node x={HUB.x} y={HUB.y} label={HUB.label} r={34} coreR={11} color="#DF0A20" tag="HUB" />
      <circle cx={HUB.x} cy={HUB.y} r={34} className="hub-node-broadcast" />

      {MODULES.map(m => (
        <Node key={m.id} x={m.x} y={m.y} label={m.label} r={14} coreR={4.5} color={m.color} tag="MODULE" />
      ))}
    </svg>
  );
};

export default NetworkDiagram;
