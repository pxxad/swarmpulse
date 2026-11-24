import React, { useState, useEffect, useRef } from 'react';
import Visualizer1D from './Visualizer1D.jsx';
import Visualizer2D from './Visualizer2D.jsx';
import StepInspector from './StepInspector.jsx';
import SwarmTable from './SwarmTable.jsx';
import ConvergenceChart from './ConvergenceChart.jsx';

export default function SimulatorView({ engine, onConfigureParams }) {
  const [engineState, setEngineState] = useState(() => engine.getState());
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepMode, setStepMode] = useState('particle'); // 'particle' | 'iteration'
  const [playbackSpeed, setPlaybackSpeed] = useState(300); // ms per step
  const timerRef = useRef(null);

  // Sync state with engine
  const refreshState = () => {
    if (engine) {
      setEngineState(engine.getState());
    }
  };

  useEffect(() => {
    if (engine) {
      setEngineState(engine.getState());
    }
  }, [engine]);

  const handleNextStep = () => {
    if (stepMode === 'particle') {
      engine.stepParticle();
    } else {
      engine.stepIteration();
    }
    refreshState();
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    engine.prevStep();
    refreshState();
  };

  const handleReset = () => {
    setIsPlaying(false);
    engine.reset();
    refreshState();
  };

  const handleFastForward = () => {
    setIsPlaying(false);
    engine.fastForward();
    refreshState();
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  // Autoplay loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        const canContinue = stepMode === 'particle'
          ? engine.stepParticle()
          : engine.stepIteration();

        refreshState();

        if (!canContinue || engine.getState().isCompleted) {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, stepMode, engine]);

  const {
    problem,
    config = {},
    currentIteration = 0,
    activeParticleIndex = 0,
    currentW = 0,
    particles = [],
    gbestPosition = [],
    gbestFitness = null,
    gbestParticleId = 'P1',
    meanFitness = 0,
    lastBreakdown = null,
    history = [],
    isCompleted = false
  } = engineState || {};

  return (
    <div className="simulator-container">
      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="controls-group">
          <button className="btn btn-secondary" onClick={handleReset} title="Reset Swarm to Iteration 0">
            Reset
          </button>
          <button
            className="btn btn-secondary"
            onClick={handlePrevStep}
            disabled={history.length <= 1 || isPlaying}
            title="Step Back"
          >
            Previous
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNextStep}
            disabled={isCompleted || isPlaying}
            title="Advance by one step"
          >
            Next Step
          </button>
          <button
            className={`btn ${isPlaying ? 'btn-secondary' : 'btn-accent'}`}
            onClick={togglePlay}
            disabled={isCompleted}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleFastForward}
            disabled={isCompleted}
            title="Fast forward to the final iteration"
          >
            Fast Forward
          </button>
        </div>

        <div className="controls-group">
          {/* Step Granularity Toggle */}
          <div className="nav-tabs" style={{ padding: '2px' }}>
            <button
              className={`nav-tab-btn ${stepMode === 'particle' ? 'active' : ''}`}
              style={{ padding: '5px 10px', fontSize: '11px' }}
              onClick={() => setStepMode('particle')}
            >
              Single Particle
            </button>
            <button
              className={`nav-tab-btn ${stepMode === 'iteration' ? 'active' : ''}`}
              style={{ padding: '5px 10px', fontSize: '11px' }}
              onClick={() => setStepMode('iteration')}
            >
              Full Iteration
            </button>
          </div>

          {/* Speed slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <span>Speed:</span>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={1050 - playbackSpeed}
              onChange={(e) => setPlaybackSpeed(1050 - parseInt(e.target.value, 10))}
              style={{ width: '80px' }}
            />
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onConfigureParams}>
            Parameters
          </button>
        </div>
      </div>

      {/* HUD Stats */}
      <div className="hud-strip">
        <div className="hud-card">
          <div className="hud-label">Iteration Progress</div>
          <div className="hud-value">
            {currentIteration} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}>/ {config.maxIterations ?? 0}</span>
          </div>
          <div className="hud-sub">
            {isCompleted ? 'Completed' : `Active Particle: ${particles[activeParticleIndex]?.id ?? 'None'}`}
          </div>
        </div>

        <div className="hud-card">
          <div className="hud-label">Global Best f(g*)</div>
          <div className="hud-value" style={{ color: 'var(--color-primary)' }}>
            {gbestFitness !== null && !isNaN(gbestFitness) ? gbestFitness.toFixed(4) : '—'}
          </div>
          <div className="hud-sub">
            Leader: {gbestParticleId ?? 'P1'} | Target: {problem?.knownOptimum?.value ?? '—'}
          </div>
        </div>

        <div className="hud-card">
          <div className="hud-label">Swarm Mean f</div>
          <div className="hud-value">
            {meanFitness != null && !isNaN(meanFitness) ? meanFitness.toFixed(4) : '—'}
          </div>
          <div className="hud-sub">
            {particles.length} particles active
          </div>
        </div>

        <div className="hud-card">
          <div className="hud-label">Current Inertia (w)</div>
          <div className="hud-value" style={{ color: 'var(--color-accent)' }}>
            {currentW != null && !isNaN(currentW) ? currentW.toFixed(4) : '—'}
          </div>
          <div className="hud-sub">
            {config.inertiaType === 'decay' ? 'Linear decay mode' : 'Fixed constant'}
          </div>
        </div>
      </div>

      {/* Main Visualizer and Inspector Layout */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          {problem.dimensions === 1 ? (
            <Visualizer1D
              problem={problem}
              particles={particles}
              gbestPosition={gbestPosition}
              gbestFitness={gbestFitness}
              activeParticleIndex={activeParticleIndex}
            />
          ) : (
            <Visualizer2D
              problem={problem}
              particles={particles}
              gbestPosition={gbestPosition}
              gbestFitness={gbestFitness}
              activeParticleIndex={activeParticleIndex}
            />
          )}
        </div>

        <div>
          <StepInspector
            breakdown={lastBreakdown}
            problem={problem}
            currentW={currentW}
          />
        </div>
      </div>

      {/* Convergence Curve & Particle Table */}
      <div className="grid-2" style={{ marginTop: '20px', alignItems: 'start' }}>
        <ConvergenceChart
          history={history}
          knownOptimum={problem.knownOptimum}
          goal={problem.goal}
          maxIterations={config.maxIterations}
        />

        <SwarmTable
          particles={particles}
          gbestParticleId={gbestParticleId}
          activeParticleIndex={activeParticleIndex}
          goal={problem.goal}
        />
      </div>
    </div>
  );
}
