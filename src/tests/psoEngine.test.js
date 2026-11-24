/**
 * Tests verifying general PSO engine mechanics,
 * step by step, rewind, fast forward, Rastrigin, and Peaks.
 */

import assert from 'node:assert';
import { createPSOEngine } from '../engine/psoEngine.js';
import { PROBLEMS } from '../engine/problems.js';

console.log('--- RUNNING PSO ENGINE TESTS ---');

// Test 1: Problem initialization and state sanity
{
  const engine = createPSOEngine('problem1');
  const state = engine.getState();
  assert.strictEqual(state.particles.length, 3, 'Default problem 1 has 3 particles');
  assert.strictEqual(state.currentIteration, 0, 'Starts at iteration 0');
  assert.strictEqual(state.gbestParticleId, 'P3', 'Initial best particle is P3 (x=2, f=4)');
  assert.strictEqual(state.gbestFitness, 4, 'Initial gbest fitness is 4');
  console.log('✓ Test 1: Problem 1 initialization passed');
}

// Test 2: Stepping and Rewind
{
  const engine = createPSOEngine('problem1');
  engine.stepParticle(); // Step P1
  let s1 = engine.getState();
  assert.strictEqual(s1.activeParticleIndex, 1, 'Active particle advanced to P2');
  assert.strictEqual(s1.historyLength, 2, 'History recorded 2 snapshots');

  engine.stepParticle(); // Step P2
  engine.stepParticle(); // Step P3
  let s3 = engine.getState();
  assert.strictEqual(s3.currentIteration, 1, 'Completed iteration 1');
  assert.strictEqual(s3.activeParticleIndex, 0, 'Active index reset to 0');

  // Test rewind (prevStep)
  const rewound = engine.prevStep();
  assert.strictEqual(rewound, true, 'Prev step succeeded');
  const sRewound = engine.getState();
  assert.strictEqual(sRewound.activeParticleIndex, 2, 'Rewound back to particle P3');
  console.log('✓ Test 2: Stepper and rewind mechanism passed');
}

// Test 3: Fast Forward and Completion
{
  const engine = createPSOEngine('problem2', { maxIterations: 10, swarmSize: 10 });
  const finalState = engine.fastForward();
  assert.strictEqual(finalState.isCompleted, true, 'Engine marked completed');
  assert.strictEqual(finalState.currentIteration, 10, 'Reached iteration 10');
  assert(finalState.gbestFitness < 20, 'Rastrigin improved from initial');
  console.log('✓ Test 3: Fast-forward and completion passed');
}

// Test 4: Peaks 2D Maximization Evaluation
{
  const engine = createPSOEngine('problem4', { maxIterations: 5, swarmSize: 10 });
  const initGbest = engine.getState().gbestFitness;
  engine.stepIteration();
  const nextGbest = engine.getState().gbestFitness;
  assert(nextGbest >= initGbest, 'For maximization, gbest must be non-decreasing');
  console.log('✓ Test 4: Problem 4 Peaks maximization monotonicity passed');
}

// Test 5: Step breakdown integrity across all problems
{
  const problemKeys = ['problem1', 'problem2', 'problem3', 'problem4'];
  for (const pKey of problemKeys) {
    const engine = createPSOEngine(pKey, { maxIterations: 5 });
    // Step through particles
    for (let i = 0; i < 15; i++) {
      engine.stepParticle();
      const st = engine.getState();
      assert(st.lastBreakdown !== null, `lastBreakdown must exist for ${pKey} after step`);
      assert(st.lastBreakdown.gbestAfter !== undefined, `gbestAfter must not be undefined for ${pKey}`);
      assert(st.lastBreakdown.gbestAfter.fitness !== undefined, `gbestAfter.fitness must not be undefined for ${pKey}`);
      assert(typeof st.lastBreakdown.gbestAfter.fitness === 'number', `gbestAfter.fitness must be a number for ${pKey}`);
      assert(typeof st.lastBreakdown.improvedGbest === 'boolean', `improvedGbest must be boolean for ${pKey}`);
      assert(typeof st.meanFitness === 'number' && !isNaN(st.meanFitness), `meanFitness must be valid number for ${pKey}`);
    }
  }
  console.log('✓ Test 5: Stepping breakdown integrity across all 4 problem statements verified');
}

console.log('ALL PSO ENGINE TESTS PASSED SUCCESSFULLY!\n');
