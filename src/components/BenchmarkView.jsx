import React, { useState, useEffect } from 'react';
import { PROBLEMS } from '../engine/problems.js';
import { createPSOEngine } from '../engine/psoEngine.js';

export default function BenchmarkView({ activeProblemKey }) {
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const problem = PROBLEMS[activeProblemKey] || PROBLEMS.problem1;

  useEffect(() => {
    setBenchmarkResults(null);
  }, [activeProblemKey]);

  const runBenchmarkBatch = () => {
    setIsRunning(true);
    setTimeout(() => {
      const runs = 20;
      const finalValues = [];

      for (let s = 1; s <= runs; s++) {
        const eng = createPSOEngine(activeProblemKey, { seed: s * 17 });
        eng.fastForward();
        finalValues.push(eng.getState().gbestFitness);
      }

      const mean = finalValues.reduce((a, b) => a + b, 0) / runs;
      const variance = finalValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / runs;
      const stdDev = Math.sqrt(variance);
      const best = problem.goal === 'minimize' ? Math.min(...finalValues) : Math.max(...finalValues);

      setBenchmarkResults({
        runs,
        mean,
        stdDev,
        best,
        all: finalValues
      });
      setIsRunning(false);
    }, 50);
  };

  const benchmarkTableData = [
    {
      id: 1,
      name: 'Bowl f(x) = x²',
      goal: 'Minimize',
      diff: 'Easy',
      dim: 1,
      n: 3,
      iters: 30,
      optimum: '0 at x = 0',
      psoResult: 'x = 0.0017, f ≈ 3e-6'
    },
    {
      id: 2,
      name: '2-D Rastrigin',
      goal: 'Minimize',
      diff: 'Hard (121 minima)',
      dim: 2,
      n: 30,
      iters: 100,
      optimum: '0 at (0, 0)',
      psoResult: 'f = 1.6e-8 (100% runs < 0.01)'
    },
    {
      id: 3,
      name: 'Inverted Parabola 10 - (x-3)²',
      goal: 'Maximize',
      diff: 'Easy',
      dim: 1,
      n: 3,
      iters: 30,
      optimum: '10 at x = 3',
      psoResult: 'x = 3.0096, f = 9.9999'
    },
    {
      id: 4,
      name: '2-D Peaks Landscape',
      goal: 'Maximize',
      diff: 'Hard (3 hills)',
      dim: 2,
      n: 30,
      iters: 100,
      optimum: '8.106 at (-0.01, 1.58)',
      psoResult: 'f = 8.1062 (100% within 0.01)'
    }
  ];

  return (
    <div className="benchmark-container">
      {/* Master Benchmark Summary */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
          Lecture Benchmark Performance Matrix
        </h2>
        <p className="card-subtitle">
          Comparative empirical performance across all 4 lecture test cases under canonical PSO configurations.
        </p>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Benchmark Problem</th>
                <th>Goal</th>
                <th>Difficulty</th>
                <th>Dim</th>
                <th>Swarm (N)</th>
                <th>Iterations</th>
                <th>True Optimum</th>
                <th>PSO Outcome</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkTableData.map(row => (
                <tr key={row.id}>
                  <td><strong>{row.id}</strong></td>
                  <td><strong>{row.name}</strong></td>
                  <td>
                    <span className={`badge-tag ${row.goal === 'Minimize' ? 'badge-min' : 'badge-max'}`}>
                      {row.goal}
                    </span>
                  </td>
                  <td>{row.diff}</td>
                  <td>{row.dim}D</td>
                  <td>{row.n}</td>
                  <td>{row.iters}</td>
                  <td>{row.optimum}</td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{row.psoResult}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-run Statistical Reliability Test */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>
              Multi-Run Statistical Verification: {problem.name}
            </h3>
            <p className="card-subtitle" style={{ margin: 0 }}>
              Executes 20 independent trials with varying PRNG seeds to assess repeatability and variance.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={runBenchmarkBatch}
            disabled={isRunning}
          >
            {isRunning ? 'Running Trials...' : 'Run 20-Seed Batch Evaluation'}
          </button>
        </div>

        {benchmarkResults && (
          <div className="grid-3" style={{ marginTop: '16px' }}>
            <div className="math-term-box">
              <div className="math-term-title">Mean Final Fitness</div>
              <div className="math-term-equation" style={{ color: 'var(--color-primary)' }}>
                {benchmarkResults.mean != null && !isNaN(benchmarkResults.mean) ? benchmarkResults.mean.toFixed(6) : '—'}
              </div>
              <div className="math-term-desc">Average outcome over {benchmarkResults.runs} trials</div>
            </div>

            <div className="math-term-box">
              <div className="math-term-title">Standard Deviation (σ)</div>
              <div className="math-term-equation">
                {benchmarkResults.stdDev != null && !isNaN(benchmarkResults.stdDev) ? benchmarkResults.stdDev.toExponential(3) : '—'}
              </div>
              <div className="math-term-desc">Empirical dispersion across seeds</div>
            </div>

            <div className="math-term-box">
              <div className="math-term-title">Best Trial Recorded</div>
              <div className="math-term-equation" style={{ color: 'var(--color-success)' }}>
                {benchmarkResults.best != null && !isNaN(benchmarkResults.best) ? benchmarkResults.best.toFixed(6) : '—'}
              </div>
              <div className="math-term-desc">Closest to theoretical optimum</div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded & IoT Resource Constraints */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">IoT &amp; WSN Node Optimization</h3>
          <p className="card-subtitle">Why PSO is uniquely advantageous on edge microcontrollers.</p>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Lightweight Memory:</strong> Each particle stores only position x, velocity v, and personal best p. Swarm storage is ~ 3 × N × D floats (2.4 KB for N=20, D=10).
            </li>
            <li>
              <strong>No Gradients:</strong> Operates entirely on objective queries without Jacobian matrices, Hessians, or backpropagation.
            </li>
            <li>
              <strong>Fixed-Point Friendly:</strong> Update formula requires only scalar additions and multiplications, running efficiently on 32-bit ARM Cortex-M or RISC-V nodes.
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 className="card-title">Practical Tuning Guidelines</h3>
          <p className="card-subtitle">Literature recommendations (Shi & Eberhart, Clerc & Kennedy).</p>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Inertia Decay:</strong> Start with w = 0.9 for broad space traversal, linearly decrease to 0.4 for deep convergence.
            </li>
            <li>
              <strong>Acceleration Balance:</strong> Set c₁ = c₂ ≈ 1.5 to 2.0 to balance individual exploration with swarm cohesion.
            </li>
            <li>
              <strong>Velocity Clamping:</strong> Cap maximum velocity at 10%–20% of variable range to eliminate runaway instability.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
