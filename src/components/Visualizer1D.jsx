import React, { useMemo, useState } from 'react';

export default function Visualizer1D({
  problem,
  particles,
  gbestPosition,
  gbestFitness,
  activeParticleIndex
}) {
  const [hoveredParticle, setHoveredParticle] = useState(null);

  const [minX, maxX] = problem.bounds;
  const paddingX = 40;
  const paddingY = 30;
  const width = 760;
  const height = 360;

  // Generate curve sampling points
  const { curvePoints, minF, maxF } = useMemo(() => {
    const points = [];
    let lowF = Infinity;
    let highF = -Infinity;
    const samples = 200;

    for (let i = 0; i <= samples; i++) {
      const x = minX + (i / samples) * (maxX - minX);
      const f = problem.evaluate([x]);
      points.push({ x, f });
      if (f < lowF) lowF = f;
      if (f > highF) highF = f;
    }

    // Add margin to Y range
    const rangeF = Math.max(0.1, highF - lowF);
    return {
      curvePoints: points,
      minF: lowF - rangeF * 0.1,
      maxF: highF + rangeF * 0.1
    };
  }, [problem, minX, maxX]);

  // Coordinate transforms
  const scaleX = (x) => paddingX + ((x - minX) / (maxX - minX)) * (width - 2 * paddingX);
  const scaleY = (f) => height - paddingY - ((f - minF) / (maxF - minF)) * (height - 2 * paddingY);

  const pathData = useMemo(() => {
    return curvePoints.reduce((acc, pt, idx) => {
      const sx = scaleX(pt.x);
      const sy = scaleY(pt.f);
      return idx === 0 ? `M ${sx} ${sy}` : `${acc} L ${sx} ${sy}`;
    }, '');
  }, [curvePoints, minF, maxF]);

  return (
    <div className="visualizer-wrapper">
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
          1-D Fitness Landscape &amp; Swarm Distribution
        </div>
        <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0284c7', display: 'inline-block' }}></span> Particle
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span> Active
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #d97706', display: 'inline-block' }}></span> Global Best (g*)
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Gridlines */}
        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} stroke="#e2e8f0" strokeWidth="1" />

        {/* X Axis Ticks */}
        {[-10, -5, -2, 0, 2, 5, 8, 10].filter(t => t >= minX && t <= maxX).map(val => (
          <g key={val} transform={`translate(${scaleX(val)}, ${height - paddingY})`}>
            <line y2="5" stroke="#94a3b8" />
            <text y="18" textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="var(--font-mono)">
              {val}
            </text>
          </g>
        ))}

        {/* Function Curve */}
        <path d={pathData} fill="none" stroke="#0284c7" strokeWidth="2.5" />

        {/* Global Best Indicator */}
        {gbestPosition && gbestPosition.length > 0 && gbestPosition[0] != null && gbestFitness != null && !isNaN(gbestFitness) && (
          <g transform={`translate(${scaleX(gbestPosition[0])}, ${scaleY(gbestFitness)})`}>
            <circle r="12" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle r="3" fill="#d97706" />
            <text x="0" y="20" textAnchor="middle" fontSize="10" fontWeight="700" fill="#b45309" fontFamily="var(--font-mono)">
              g*
            </text>
          </g>
        )}

        {/* Particles */}
        {(particles || []).map((p, idx) => {
          if (!p || !p.position || p.position.length === 0 || p.position[0] == null) return null;
          const px = scaleX(p.position[0]);
          const py = p.fitness != null && !isNaN(p.fitness) ? scaleY(p.fitness) : (height - paddingY);
          const isActive = idx === activeParticleIndex;
          const isGbest = gbestPosition && gbestPosition.length > 0 && gbestPosition[0] != null && Math.abs(p.position[0] - gbestPosition[0]) < 1e-4;
          const vel = p.velocity && p.velocity[0] != null ? p.velocity[0] : 0;
          const arrowLength = Math.max(-36, Math.min(36, vel * 12));

          return (
            <g
              key={p.id ?? idx}
              transform={`translate(${px}, ${py})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredParticle(p)}
              onMouseLeave={() => setHoveredParticle(null)}
            >
              {/* Velocity Arrow */}
              {Math.abs(arrowLength) > 2 && (
                <line
                  x1="0"
                  y1="0"
                  x2={arrowLength}
                  y2="0"
                  stroke={isActive ? '#10b981' : '#64748b'}
                  strokeWidth="1.5"
                />
              )}

              {/* Active Pulse Ring */}
              {isActive && (
                <circle r="10" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.8" />
              )}

              {/* Particle Dot */}
              <circle
                r={isActive ? 5 : 4}
                fill={isGbest ? '#d97706' : isActive ? '#10b981' : '#0284c7'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* Label */}
              <text
                x="0"
                y="-10"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="var(--color-text-main)"
                fontFamily="var(--font-mono)"
              >
                {p.id ?? `P${idx + 1}`}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredParticle && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none'
        }}>
          {hoveredParticle.id}: x = {hoveredParticle.position?.[0] != null ? hoveredParticle.position[0].toFixed(4) : '—'} | v = {hoveredParticle.velocity?.[0] != null ? hoveredParticle.velocity[0].toFixed(4) : '—'} | f(x) = {hoveredParticle.fitness != null ? hoveredParticle.fitness.toFixed(4) : '—'}
        </div>
      )}
    </div>
  );
}
