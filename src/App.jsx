import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import TheoryView from './components/TheoryView.jsx';
import ParametersView from './components/ParametersView.jsx';
import SimulatorView from './components/SimulatorView.jsx';
import BenchmarkView from './components/BenchmarkView.jsx';
import { PROBLEMS } from './engine/problems.js';
import { createPSOEngine } from './engine/psoEngine.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [activeProblemKey, setActiveProblemKey] = useState('problem1');
  const [paramsMap, setParamsMap] = useState(() => {
    const map = {};
    Object.keys(PROBLEMS).forEach(k => {
      map[k] = { ...PROBLEMS[k].defaultParams };
    });
    return map;
  });

  const currentParams = paramsMap[activeProblemKey] || PROBLEMS[activeProblemKey]?.defaultParams || {};

  const setParams = (updater) => {
    setParamsMap(prev => {
      const nextVal = typeof updater === 'function' ? updater(prev[activeProblemKey]) : updater;
      return {
        ...prev,
        [activeProblemKey]: nextVal
      };
    });
  };

  const handleSelectProblem = (key) => {
    setActiveProblemKey(key);
  };

  // Re-create engine whenever active problem or params change
  const engine = useMemo(() => {
    return createPSOEngine(activeProblemKey, currentParams);
  }, [activeProblemKey, currentParams]);

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProblemKey={activeProblemKey}
        onSelectProblem={handleSelectProblem}
      />

      <main className="main-content">
        {activeTab === 'theory' && (
          <TheoryView
            activeProblemKey={activeProblemKey}
            onProceedToParams={() => setActiveTab('parameters')}
          />
        )}

        {activeTab === 'parameters' && (
          <ParametersView
            activeProblemKey={activeProblemKey}
            params={currentParams}
            setParams={setParams}
            onLaunchSimulator={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView
            key={`${activeProblemKey}-${JSON.stringify(currentParams)}`}
            engine={engine}
            onConfigureParams={() => setActiveTab('parameters')}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkView
            activeProblemKey={activeProblemKey}
          />
        )}
      </main>
    </div>
  );
}
