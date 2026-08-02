import React from 'react';

const NODES = [
  { id: 'coord', x: 500, y: 78, label: 'Coordination Office', sub: 'Central' },
  { id: 'saida', x: 190, y: 300, label: 'Saida Base', sub: 'Field Base' },
  { id: 'tripoli', x: 810, y: 300, label: 'Tripoli Base', sub: 'Field Base' },
];

const EDGES = [
  ['coord', 'saida'],
  ['coord', 'tripoli'],
  ['saida', 'tripoli'],
];

const NetworkDiagram = () => {
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));

  return (
    <svg viewBox="0 0 1000 380" preserveAspectRatio="xMidYMid meet" className="network-diagram" role="img" aria-label="Network diagram connecting the Coordination Office with the Saida and Tripoli field bases">
      {EDGES.map(([a, b], i) => {
        const p1 = byId[a];
        const p2 = byId[b];
        return (
          <line
            key={`${a}-${b}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            className="flow-edge"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        );
      })}

      {NODES.map(n => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={20} className="flow-node-ring" />
          <circle cx={n.x} cy={n.y} r={7} className="flow-node-core" />
          <text x={n.x} y={n.y + 42} textAnchor="middle" fill="#e2e8f0" fontSize="17" fontWeight="700" fontFamily="var(--font-sans)">
            {n.label}
          </text>
          <text x={n.x} y={n.y + 62} textAnchor="middle" fill="#5eead4" fontSize="11" letterSpacing="0.1em" fontFamily="var(--font-mono)">
            {n.sub.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default NetworkDiagram;
