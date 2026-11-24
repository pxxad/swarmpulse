import React, { useMemo } from 'react';

export default function ConvergenceChart({
  history,
  knownOptimum,
  goal,
  maxIterations
}) {
  const width = 680;
  const height = 240;
  const paddingX = 45;
  const paddingY = 25;

  const { pointsGbest, pointsMean, minY, maxY, currentGbest, currentMean } = useMemo(() => {
    if (!history || history.length === 0) {
      return { pointsGbest: [], pointsMean: [], minY: 0, maxY: 10, currentGbest: 0, currentMean: 0 };
    }

    // Filter to one data point per completed iteration
    const iterMap = new Map();
    history.forEach(h => {
      iterMap.set(h.iteration, { gbest: h.gbestFitness, mean: h.meanFitness });
    });

    const entries = Array.from(iterMap.entries()).sort((a, b) => a[0] - b[0]);

    let lowY = Infinity;
    let highY = -Infinity;

    entries.forEach(([_, val]) => {
      if (val.gbest < lowY) lowY = val.gbest;
      if (val.gbest > highY) highY = val.gbest;
      if (val.mean < lowY) lowY = val.mean;
      if (val.mean > highY) highY = val.mean;
    });

    if (knownOptimum && knownOptimum.value !== undefined) {
      if (knownOptimum.value < lowY) lowY = knownOptimum.value;
      if (knownOptimum.value > highY) highY = knownOptimum.value;
    }

    const rangeY = Math.max(1e-4, highY - lowY);
    const paddedMinY = lowY - rangeY * 0.08;
    const paddedMaxY = highY + rangeY * 0.08;

    const maxT = Math.max(1, maxIterations);

    const pG = entries.map(([iter, val]) => ({
      x: paddingX + (iter / maxT) * (width - 2 * paddingX),
      y: height - paddingY - ((val.gbest - paddedMinY) / (paddedMaxY - paddedMinY)) * (height - 2 * paddingY)
    }));

    const pM = entries.map(([iter, val]) => ({
      x: paddingX + (iter / maxT) * (width - 2 * paddingX),
      y: height - paddingY - ((val.mean - paddedMinY) / (paddedMaxY - paddedMinY)) * (height - 2 * paddingY)
    }));

    const latest = entries[entries.length - 1];

    return {
      pointsGbest: pG,
      pointsMean: pM,
      minY: paddedMinY,
      maxY: paddedMaxY,
      currentGbest: latest ? latest[1].gbest : 0,
      currentMean: latest ? latest[1].mean : 0
    };
  }, [history, knownOptimum, maxIterations]);

  const pathGbest = useMemo(() => {
    return pointsGbest.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
  }, [pointsGbest]);

  const pathMean = useMemo(() => {
    return pointsMean.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
  }, [pointsMean]);

  // Known target optimum horizontal line Y
  const targetY = knownOptimum && knownOptimum.value !== undefined && maxY > minY
    ? height - paddingY - ((knownOptimum.value - minY) / (maxY - minY)) * (height - 2 * paddingY)
    : null;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 className="card-title" style={{ margin: 0 }}>Real-time Convergence Profile</h3>
        <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 14, height: 2, backgroundColor: '#0284c7', display: 'inline-block' }}></span>
            Global Best: <strong>{currentGbest.toFixed(4)}</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 14, height: 2, borderTop: '2px dashed #94a3b8', display: 'inline-block' }}></span>
            Swarm Mean: <strong>{currentMean.toFixed(4)}</strong>
          </span>
          {knownOptimum && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 14, height: 2, backgroundColor: '#10b981', display: 'inline-block' }}></span>
              Target Optimum: <strong>{knownOptimum.value}</strong>
            </span>
          )}
        </div>
      </div>
      <p className="card-subtitle">
        Tracks monotonic leader improvement vs exploratory swarm diversity over time.
      </p>

      <div className="visualizer-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Axis and Grid */}
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e2e8f0" strokeWidth="1" />
          <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} stroke="#e2e8f0" strokeWidth="1" />

          {/* Known Optimum reference line */}
          {targetY !== null && targetY >= paddingY && targetY <= height - paddingY && (
            <g>
              <line x1={paddingX} y1={targetY} x2={width - paddingX} y2={targetY} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x={width - paddingX + 4} y={targetY + 3} fontSize="9" fill="#059669" fontFamily="var(--font-mono)">
                opt
              </text>
            </g>
          )}

          {/* Curves */}
          {pathMean && <path d={pathMean} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />}
          {pathGbest && <path d={pathGbest} fill="none" stroke="#0284c7" strokeWidth="2.5" />}

          {/* Ticks and Labels */}
          <text x={paddingX} y={height - 8} fontSize="10" fill="#64748b" fontFamily="var(--font-mono)">0</text>
          <text x={width - paddingX} y={height - 8} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="var(--font-mono)">
            Iter {maxIterations}
          </text>
          <text x={paddingX - 8} y={paddingY + 8} textAnchor="end" fontSize="9" fill="#64748b" fontFamily="var(--font-mono)">
            {maxY.toFixed(2)}
          </text>
          <text x={paddingX - 8} y={height - paddingY} textAnchor="end" fontSize="9" fill="#64748b" fontFamily="var(--font-mono)">
            {minY.toFixed(2)}
          </text>
        </svg>
      </div>
    </div>
  );
}
