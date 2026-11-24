import React from 'react';
import { PROBLEMS } from '../engine/problems.js';

export default function Navbar({
  activeTab,
  setActiveTab,
  activeProblemKey,
  onSelectProblem
}) {
  const tabs = [
    { id: 'theory', label: 'Problem & Theory' },
    { id: 'parameters', label: 'Parameters' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'benchmark', label: 'Benchmark' }
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-section">
          <div className="brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <div>
            <div className="brand-title">SwarmPulse</div>
            <div className="brand-subtitle">Particle Swarm Optimization Lab</div>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Main Navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="problem-selector-bar">
        <div className="problem-selector-inner">
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Problem:
          </span>
          {Object.keys(PROBLEMS).map((key) => {
            const prob = PROBLEMS[key];
            const isSelected = activeProblemKey === key;
            return (
              <button
                key={key}
                className={`problem-pill ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectProblem(key)}
              >
                <span>{prob.name}</span>
                <span className={`badge-tag ${prob.goal === 'minimize' ? 'badge-min' : 'badge-max'}`}>
                  {prob.goal}
                </span>
                <span className="badge-tag badge-dim">
                  {prob.dimensions}D
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
