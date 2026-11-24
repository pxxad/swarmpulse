import React, { useEffect, useRef, useState } from 'react';

export default function Visualizer2D({
  problem,
  particles,
  gbestPosition,
  gbestFitness,
  activeParticleIndex
}) {
  const canvasRef = useRef(null);
  const [hoveredParticle, setHoveredParticle] = useState(null);

  const [minBound, maxBound] = problem.bounds;
  const size = 500;
  const padding = 30;

  // Render landscape heatmap texture
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const res = 100;
    const imgData = ctx.createImageData(res, res);

    let minF = Infinity;
    let maxF = -Infinity;
    const values = new Float32Array(res * res);

    for (let py = 0; py < res; py++) {
      for (let px = 0; px < res; px++) {
        // Invert Y for Cartesian coordinates
        const x = minBound + (px / (res - 1)) * (maxBound - minBound);
        const y = maxBound - (py / (res - 1)) * (maxBound - minBound);
        const val = problem.evaluate([x, y]);
        const idx = py * res + px;
        values[idx] = val;
        if (val < minF) minF = val;
        if (val > maxF) maxF = val;
      }
    }

    const rangeF = Math.max(1e-5, maxF - minF);

    for (let i = 0; i < values.length; i++) {
      const norm = (values[i] - minF) / rangeF; // 0 (min) to 1 (max)
      // Color scheme: deep slate/navy -> cyan -> white
      const heat = problem.goal === 'minimize' ? 1 - norm : norm;

      const r = Math.floor(15 + heat * 175);
      const g = Math.floor(35 + heat * 195);
      const b = Math.floor(75 + heat * 170);

      const pIdx = i * 4;
      imgData.data[pIdx] = r;
      imgData.data[pIdx + 1] = g;
      imgData.data[pIdx + 2] = b;
      imgData.data[pIdx + 3] = 230;
    }

    // Draw to offscreen buffer and scale smoothly
    createImageBitmap(imgData).then((bmp) => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(bmp, padding, padding, size - 2 * padding, size - 2 * padding);
    });
  }, [problem, minBound, maxBound]);

  // Coordinate transforms
  const scaleX = (x) => padding + ((x - minBound) / (maxBound - minBound)) * (size - 2 * padding);
  const scaleY = (y) => padding + ((maxBound - y) / (maxBound - minBound)) * (size - 2 * padding);

  return (
    <div className="visualizer-wrapper" style={{ maxWidth: `${size}px`, margin: '0 auto' }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
          2-D Contour Landscape (x₁, x₂)
        </div>
        <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #d97706', display: 'inline-block' }}></span> Global Best (g*)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0284c7', display: 'inline-block' }}></span> Swarm ({particles.length})
          </span>
        </div>
      </div>

      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />

        <svg
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}
        >
          {/* Boundary Box */}
          <rect
            x={padding}
            y={padding}
            width={size - 2 * padding}
            height={size - 2 * padding}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Coordinate Axis Labels */}
          <text x={padding} y={size - 10} fontSize="10" fill="#64748b" fontFamily="var(--font-mono)">
            {minBound}
          </text>
          <text x={size - padding - 15} y={size - 10} fontSize="10" fill="#64748b" fontFamily="var(--font-mono)">
            {maxBound}
          </text>
          <text x={8} y={padding + 10} fontSize="10" fill="#64748b" fontFamily="var(--font-mono)">
            {maxBound}
          </text>
          <text x={8} y={size - padding} fontSize="10" fill="#64748b" fontFamily="var(--font-mono)">
            {minBound}
          </text>

          {/* Global Best Beacon */}
          {gbestPosition && gbestPosition.length >= 2 && (
            <g transform={`translate(${scaleX(gbestPosition[0])}, ${scaleY(gbestPosition[1])})`}>
              <circle r="14" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle r="3" fill="#d97706" />
              <text x="0" y="20" textAnchor="middle" fontSize="10" fontWeight="700" fill="#b45309" fontFamily="var(--font-mono)">
                g*
              </text>
            </g>
          )}

          {/* Particles */}
          {particles.map((p, idx) => {
            const px = scaleX(p.position[0]);
            const py = scaleY(p.position[1]);
            const vx = p.velocity[0];
            const vy = p.velocity[1];
            const isActive = idx === activeParticleIndex;

            const arrowFactor = 4;
            const endX = px + vx * arrowFactor;
            const endY = py - vy * arrowFactor;

            return (
              <g
                key={p.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredParticle(p)}
                onMouseLeave={() => setHoveredParticle(null)}
              >
                {/* Velocity line */}
                <line
                  x1={px}
                  y1={py}
                  x2={endX}
                  y2={endY}
                  stroke={isActive ? '#10b981' : 'rgba(255, 255, 255, 0.75)'}
                  strokeWidth="1.5"
                />

                {/* Particle Circle */}
                <circle
                  cx={px}
                  cy={py}
                  r={isActive ? 5 : 3.5}
                  fill={isActive ? '#10b981' : '#0284c7'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>

        {hoveredParticle && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            {hoveredParticle.id}: [{hoveredParticle.position[0].toFixed(3)}, {hoveredParticle.position[1].toFixed(3)}] | f = {hoveredParticle.fitness.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
}
