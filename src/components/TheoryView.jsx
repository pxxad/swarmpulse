import React from 'react';
import { PROBLEMS } from '../engine/problems.js';

export default function TheoryView({ activeProblemKey, onProceedToParams }) {
  const problem = PROBLEMS[activeProblemKey];

  return (
    <div className="theory-container">
      {/* Active Problem Spotlight */}
      <div className="card" style={{ backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div>
            <span className={`badge-tag ${problem.goal === 'minimize' ? 'badge-min' : 'badge-max'}`} style={{ marginRight: '8px' }}>
              {problem.category}
            </span>
            <span className="badge-tag badge-dim">
              {problem.dimensions}-Dimensional
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginTop: '6px' }}>{problem.name}</h2>
          </div>
          <button className="btn btn-primary" onClick={onProceedToParams}>
            Configure Parameters
          </button>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5' }}>
          {problem.description}
        </p>

        <div className="grid-3" style={{ marginTop: '12px' }}>
          <div className="math-term-box">
            <div className="math-term-title">Objective Function</div>
            <div className="math-term-equation">{problem.formulaLatex}</div>
          </div>
          <div className="math-term-box">
            <div className="math-term-title">Search Space Bounds</div>
            <div className="math-term-equation">[{problem.bounds[0]}, {problem.bounds[1]}]^{problem.dimensions}</div>
          </div>
          <div className="math-term-box">
            <div className="math-term-title">Known Theoretical Optimum</div>
            <div className="math-term-equation">
              x* = {JSON.stringify(problem.knownOptimum.position)}, f(x*) = {problem.knownOptimum.value}
            </div>
          </div>
        </div>
      </div>

      {/* The Core PSO Equation */}
      <div className="card">
        <h3 className="card-title">Canonical PSO Motion Equations</h3>
        <p className="card-subtitle">
          At every iteration t, each particle i updates its velocity v and position x across all dimensions d using three distinct physical pulls.
        </p>

        <div style={{
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          overflowX: 'auto',
          marginBottom: '20px'
        }}>
          <div style={{ color: '#38bdf8', marginBottom: '6px' }}>
            // 1. Velocity Update Equation:
          </div>
          <div>vᵢ(t+1) = <span style={{ color: '#67e8f9' }}>w · vᵢ(t)</span> + <span style={{ color: '#a7f3d0' }}>c₁ · r₁ · [pᵢ − xᵢ(t)]</span> + <span style={{ color: '#fde047' }}>c₂ · r₂ · [g − xᵢ(t)]</span></div>
          <div style={{ color: '#38bdf8', marginTop: '12px', marginBottom: '6px' }}>
            // 2. Position Update Equation:
          </div>
          <div>xᵢ(t+1) = xᵢ(t) + vᵢ(t+1)</div>
        </div>

        <div className="grid-3">
          <div className="math-term-box">
            <div className="math-term-title" style={{ color: '#0891b2' }}>1. Inertia Component (w · v)</div>
            <div className="math-term-desc" style={{ color: 'var(--color-text-main)', fontSize: '12px', lineHeight: '1.5' }}>
              Keeps the particle moving along its current trajectory. High inertia (0.9) fosters global exploration across valleys; decaying to low inertia (0.4) shifts focus to fine local exploitation.
            </div>
          </div>

          <div className="math-term-box">
            <div className="math-term-title" style={{ color: '#059669' }}>2. Cognitive Component (c₁ · r₁ · (p - x))</div>
            <div className="math-term-desc" style={{ color: 'var(--color-text-main)', fontSize: '12px', lineHeight: '1.5' }}>
              Personal memory pull. Attracts the particle back towards its personal historical best position (pᵢ) found so far, scaled by acceleration coefficient c₁ and uniform random draw r₁ ∈ [0, 1].
            </div>
          </div>

          <div className="math-term-box">
            <div className="math-term-title" style={{ color: '#d97706' }}>3. Social Component (c₂ · r₂ · (g - x))</div>
            <div className="math-term-desc" style={{ color: 'var(--color-text-main)', fontSize: '12px', lineHeight: '1.5' }}>
              Swarm cooperation pull. Attracts the particle towards the global best position (g) discovered by any member in the swarm, scaled by c₂ and independent random draw r₂ ∈ [0, 1].
            </div>
          </div>
        </div>
      </div>

      {/* Bird Flocking Analogy & Algorithm Lifecycle */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Flock Analogy</h3>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '10px' }}>
              A flock of birds searches a large field for the spot with the most food. No bird knows where the food is beforehand.
            </p>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Particle:</strong> Candidate solution x in the search space.</li>
              <li><strong>Position x:</strong> Current candidate solution coordinates.</li>
              <li><strong>Velocity v:</strong> Step vector added to x each iteration.</li>
              <li><strong>Personal Best (pbest):</strong> Best position this particle has visited.</li>
              <li><strong>Global Best (gbest):</strong> Best position found by any particle in the swarm.</li>
              <li><strong>Fitness f(x):</strong> Objective function value evaluated at point x.</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Algorithmic Lifecycle</h3>
          <ol style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Initialize:</strong> Scatter N candidate particles across bounds; assign initial velocities (0 or small random).</li>
            <li><strong>Evaluate:</strong> Compute objective f(x) for all particles. Initialize pbest = x and gbest = best(pbest).</li>
            <li><strong>Velocity Update:</strong> Calculate inertia + cognitive + social forces. Apply velocity clamp v_max if enabled.</li>
            <li><strong>Position Step:</strong> Add new velocity to position. Enforce boundary clipping [x_min, x_max].</li>
            <li><strong>Update Records:</strong> If f(x_new) improves over pbest, update pbest. Update gbest with the swarm's champion.</li>
            <li><strong>Repeat:</strong> Continue until maximum iterations are reached or convergence criteria met.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
