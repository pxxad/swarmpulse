import React from 'react';
import { PROBLEMS } from '../engine/problems.js';

export default function ParametersView({
  activeProblemKey,
  params,
  setParams,
  onLaunchSimulator
}) {
  const problem = PROBLEMS[activeProblemKey] || PROBLEMS.problem1;
  const currentParams = { ...(problem?.defaultParams || {}), ...(params || {}) };

  const handleResetToLecture = () => {
    setParams({ ...problem.defaultParams });
  };

  const handleChange = (field, value) => {
    setParams(prev => ({
      ...(prev || {}),
      [field]: value
    }));
  };

  return (
    <div className="parameters-container">
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Configure Swarm Hyperparameters</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Tailor swarm population size, acceleration coefficients, inertia decay, and search limits for {problem.name}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleResetToLecture}>
            Lecture Preset
          </button>
          <button className="btn btn-primary" onClick={onLaunchSimulator}>
            Launch Simulator
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Swarm & Iteration Controls */}
        <div className="card">
          <h3 className="card-title">Swarm Size & Horizon</h3>
          <p className="card-subtitle">Controls the population density and simulation length.</p>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="form-label" style={{ margin: 0 }}>Swarm Size (N)</label>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>{currentParams.swarmSize}</span>
            </div>
            <input
              type="range"
              min="2"
              max="100"
              value={currentParams.swarmSize}
              onChange={(e) => handleChange('swarmSize', parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
            <div className="form-helper">Lecture notes use N=3 for hand calculations, N=30 for 2-D benchmarks.</div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="form-label" style={{ margin: 0 }}>Maximum Iterations (T)</label>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>{currentParams.maxIterations}</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              value={currentParams.maxIterations}
              onChange={(e) => handleChange('maxIterations', parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
            <div className="form-helper">Number of iterations before termination.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Random Seed</label>
            <input
              type="number"
              className="form-input"
              value={currentParams.seed ?? 42}
              onChange={(e) => handleChange('seed', parseInt(e.target.value, 10) || 1)}
            />
            <div className="form-helper">Controls deterministic PRNG pseudo-random sequence for repeatability.</div>
          </div>
        </div>

        {/* Inertia Weight Dynamics */}
        <div className="card">
          <h3 className="card-title">Inertia Weight (w) Strategy</h3>
          <p className="card-subtitle">Regulates the balance between global exploration and local exploitation.</p>

          <div className="form-group">
            <label className="form-label">Inertia Mode</label>
            <select
              className="form-select"
              value={currentParams.inertiaType}
              onChange={(e) => handleChange('inertiaType', e.target.value)}
            >
              <option value="fixed">Constant Inertia (Fixed w)</option>
              <option value="decay">Linear Decay (Shi & Eberhart: w_start → w_end)</option>
            </select>
          </div>

          {currentParams.inertiaType === 'fixed' ? (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>Constant Inertia (w)</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>{currentParams.inertiaWeight}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.05"
                value={currentParams.inertiaWeight}
                onChange={(e) => handleChange('inertiaWeight', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div className="form-helper">Fixed at 0.7 for hand calculations. Values &gt; 1 can cause divergence.</div>
            </div>
          ) : (
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Initial Inertia (w₀)</label>
                <input
                  type="number"
                  step="0.05"
                  className="form-input"
                  value={currentParams.inertiaStart}
                  onChange={(e) => handleChange('inertiaStart', parseFloat(e.target.value))}
                />
                <div className="form-helper">High exploration start (e.g. 0.9)</div>
              </div>
              <div className="form-group">
                <label className="form-label">Final Inertia (w₁)</label>
                <input
                  type="number"
                  step="0.05"
                  className="form-input"
                  value={currentParams.inertiaEnd}
                  onChange={(e) => handleChange('inertiaEnd', parseFloat(e.target.value))}
                />
                <div className="form-helper">Fine exploitation end (e.g. 0.4)</div>
              </div>
            </div>
          )}
        </div>

        {/* Acceleration Coefficients */}
        <div className="card">
          <h3 className="card-title">Acceleration Pulls (c₁, c₂)</h3>
          <p className="card-subtitle">Scales the cognitive memory vs social flocking influences.</p>

          <div className="grid-2">
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>Cognitive (c₁)</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>{currentParams.c1}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={currentParams.c1}
                onChange={(e) => handleChange('c1', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div className="form-helper">Trust in personal best position.</div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>Social (c₂)</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>{currentParams.c2}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={currentParams.c2}
                onChange={(e) => handleChange('c2', parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div className="form-helper">Attraction to swarm leader.</div>
            </div>
          </div>
        </div>

        {/* Velocity Clamping & Boundaries */}
        <div className="card">
          <h3 className="card-title">Velocity Clamping & Constraints</h3>
          <p className="card-subtitle">Prevents particle explosion and flying out of bounds.</p>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={currentParams.useVelocityClamp}
                onChange={(e) => handleChange('useVelocityClamp', e.target.checked)}
              />
              Enable Velocity Clamping (v_max)
            </label>
            <div className="form-helper">Clamps particle speed to a fraction of the search range.</div>
          </div>

          {currentParams.useVelocityClamp && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>Clamp Range Percentage</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>{currentParams.clampPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={currentParams.clampPercent}
                onChange={(e) => handleChange('clampPercent', parseInt(e.target.value, 10))}
                style={{ width: '100%' }}
              />
              <div className="form-helper">Lecture notes standard: 20% of the variable range.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
