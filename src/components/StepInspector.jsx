import React, { useState } from 'react';

export default function StepInspector({ breakdown, problem, currentW }) {
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'math'

  if (!breakdown) {
    return (
      <div className="card">
        <h3 className="card-title">Step Math Inspector</h3>
        <p className="card-subtitle">
          Real-time mathematical decomposition of velocity vectors, personal best updates, and boundary actions.
        </p>
        <div style={{
          padding: '24px',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-muted)',
          fontSize: '13px'
        }}>
          Press <strong>Next Step</strong> or <strong>Play</strong> to trace the exact numerical calculations for the swarm.
        </div>
      </div>
    );
  }

  const dim0 = breakdown.dimensions[0];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 className="card-title" style={{ margin: 0 }}>
          Step Inspector: Particle {breakdown.particleId}
        </h3>
        <div className="nav-tabs" style={{ padding: '2px' }}>
          <button
            className={`nav-tab-btn ${viewMode === 'summary' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '11px' }}
            onClick={() => setViewMode('summary')}
          >
            Summary
          </button>
          <button
            className={`nav-tab-btn ${viewMode === 'math' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '11px' }}
            onClick={() => setViewMode('math')}
          >
            Math Breakdown
          </button>
        </div>
      </div>

      <p className="card-subtitle">
        Iteration {breakdown.currentIteration + 1} &bull; Inertia Weight w = {currentW.toFixed(4)}
      </p>

      {viewMode === 'summary' ? (
        <div className="grid-3" style={{ gap: '12px' }}>
          {/* Position & Velocity Card */}
          <div className="math-term-box">
            <div className="math-term-title">Position &amp; Velocity Update</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: '1.6' }}>
              <div>Old x: [{breakdown.oldPosition.map(n => n.toFixed(4)).join(', ')}]</div>
              <div>Velocity v: [{breakdown.newVelocity.map(n => n.toFixed(4)).join(', ')}]</div>
              <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                New x: [{breakdown.newPosition.map(n => n.toFixed(4)).join(', ')}]
              </div>
            </div>
            {dim0.wasClipped && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--color-warning)', fontWeight: 600 }}>
                Clipped to search bounds [{dim0.bounds[0]}, {dim0.bounds[1]}]
              </div>
            )}
            {dim0.wasClamped && (
              <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
                Velocity clamped to ±{dim0.vMax.toFixed(2)}
              </div>
            )}
          </div>

          {/* Fitness & Objective Card */}
          <div className="math-term-box">
            <div className="math-term-title">Objective Evaluation</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: '1.6' }}>
              <div>Evaluated f(x): <strong style={{ color: 'var(--color-text-main)' }}>{breakdown.newFitness.toFixed(4)}</strong></div>
              <div>Previous f: {breakdown.oldFitness.toFixed(4)}</div>
              <div>Target optimum: {problem.knownOptimum.value}</div>
            </div>
          </div>

          {/* Personal & Global Record Card */}
          <div className="math-term-box">
            <div className="math-term-title">Memory &amp; Swarm Record</div>
            <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <div>
                Personal best:{' '}
                {breakdown.improvedPbest ? (
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                    Improved ({breakdown.newPbestFitness.toFixed(4)})
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    Retained ({breakdown.newPbestFitness.toFixed(4)})
                  </span>
                )}
              </div>
              <div style={{ marginTop: '4px' }}>
                Global best:{' '}
                {breakdown.improvedGbest ? (
                  <span style={{ color: '#b45309', fontWeight: 700 }}>
                    New Swarm Leader ({breakdown.gbestAfter.fitness.toFixed(4)})
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    Unchanged
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Numerical Formula Breakdown */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {breakdown.dimensions.map((dim) => (
            <div
              key={dim.dimIndex}
              style={{
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>
                Dimension {dim.dimIndex + 1} Calculations:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Inertia Pull:</div>
                  <div>w · v = {dim.w.toFixed(2)} × {dim.vOld.toFixed(4)} = <strong>{dim.inertiaTerm.toFixed(4)}</strong></div>
                </div>

                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Cognitive Pull:</div>
                  <div>c₁·r₁·(p - x) = {dim.c1.toFixed(1)} × {dim.r1.toFixed(2)} × ({dim.pbest.toFixed(4)} - {dim.xOld.toFixed(4)}) = <strong>{dim.cognitiveTerm.toFixed(4)}</strong></div>
                </div>

                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Social Pull:</div>
                  <div>c₂·r₂·(g - x) = {dim.c2.toFixed(1)} × {dim.r2.toFixed(2)} × ({dim.gbest.toFixed(4)} - {dim.xOld.toFixed(4)}) = <strong>{dim.socialTerm.toFixed(4)}</strong></div>
                </div>
              </div>

              <div style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid var(--color-border)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  v_new = {dim.inertiaTerm.toFixed(4)} + {dim.cognitiveTerm.toFixed(4)} + {dim.socialTerm.toFixed(4)} = <strong>{dim.finalV.toFixed(4)}</strong>
                  {dim.wasClamped && <span style={{ color: 'var(--color-primary)', marginLeft: '6px' }}>(Clamped)</span>}
                </div>
                <div>
                  x_new = {dim.xOld.toFixed(4)} + {dim.finalV.toFixed(4)} = <strong>{dim.finalX.toFixed(4)}</strong>
                  {dim.wasClipped && <span style={{ color: 'var(--color-warning)', marginLeft: '6px' }}>(Clipped)</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
