/**
 * Strict verification tests checking Problem 1 and Problem 3 hand calculations
 * against the exact tables and values presented in the lecture notes.
 */

import assert from 'node:assert';
import { createPSOEngine } from '../engine/psoEngine.js';

console.log('--- RUNNING LECTURE REPLAY VALIDATION TESTS ---');

function approx(val, expected, tolerance = 0.005) {
  assert(
    Math.abs(val - expected) < tolerance,
    `Value ${val} differs from expected ${expected} by more than ${tolerance}`
  );
}

// -------------------------------------------------------------
// PROBLEM 1 VERIFICATION (Minimization f(x) = x^2)
// -------------------------------------------------------------
{
  const engine = createPSOEngine('problem1');

  // Iteration 0
  const s0 = engine.getState();
  approx(s0.particles[0].position[0], 4.0);
  approx(s0.particles[1].position[0], -3.0);
  approx(s0.particles[2].position[0], 2.0);
  approx(s0.gbestFitness, 4.0);
  approx(s0.gbestPosition[0], 2.0);

  // Iteration 1 - Step P1
  engine.stepParticle();
  const sP1 = engine.getState();
  approx(sP1.particles[0].velocity[0], -2.58);
  approx(sP1.particles[0].position[0], 1.42);
  approx(sP1.particles[0].fitness, 2.0164);
  approx(sP1.particles[0].pbestPosition[0], 1.42);

  // Step P2
  engine.stepParticle();
  const sP2 = engine.getState();
  approx(sP2.particles[1].velocity[0], 1.875);
  approx(sP2.particles[1].position[0], -1.125);
  approx(sP2.particles[1].fitness, 1.2656);
  approx(sP2.particles[1].pbestPosition[0], -1.125);

  // Step P3
  engine.stepParticle();
  const sP3 = engine.getState();
  approx(sP3.particles[2].velocity[0], 0.0);
  approx(sP3.particles[2].position[0], 2.0);
  approx(sP3.particles[2].fitness, 4.0);
  // Now that Iteration 1 is complete, new gbest is updated
  approx(sP3.gbestPosition[0], -1.125);
  approx(sP3.gbestFitness, 1.2656);

  // Iteration 2 (Full Iteration)
  engine.stepIteration();
  const sIter2 = engine.getState();
  // P1 in Iter 2 overshot to -3.4018, kept pbest 1.42
  approx(sIter2.particles[0].position[0], -3.4018);
  approx(sIter2.particles[0].fitness, 11.5722);
  approx(sIter2.particles[0].pbestPosition[0], 1.42);

  // P2 in Iter 2 reached 0.1875, f=0.0352
  approx(sIter2.particles[1].position[0], 0.1875);
  approx(sIter2.particles[1].fitness, 0.0352);
  approx(sIter2.particles[1].pbestPosition[0], 0.1875);

  // P3 in Iter 2 reached 0.5938, f=0.3526
  approx(sIter2.particles[2].position[0], 0.5938);
  approx(sIter2.particles[2].fitness, 0.3526);

  approx(sIter2.gbestPosition[0], 0.1875);
  approx(sIter2.gbestFitness, 0.0352);

  // Iteration 3
  engine.stepIteration();
  const sIter3 = engine.getState();
  approx(sIter3.particles[0].position[0], -2.3291);
  approx(sIter3.particles[1].position[0], 1.1062);
  approx(sIter3.particles[2].position[0], -0.8537);
  approx(sIter3.gbestPosition[0], 0.1875);
  approx(sIter3.gbestFitness, 0.0352);

  console.log('✓ Problem 1: Lecture hand calculation exact match verified (Iter 0-3)');
}

// -------------------------------------------------------------
// PROBLEM 3 VERIFICATION (Maximization f(x) = 10 - (x - 3)^2)
// -------------------------------------------------------------
{
  const engine = createPSOEngine('problem3');

  // Iteration 0
  const s0 = engine.getState();
  approx(s0.particles[0].position[0], -4.0);
  approx(s0.particles[0].fitness, -39.0);
  approx(s0.particles[1].position[0], 1.0);
  approx(s0.particles[1].fitness, 6.0);
  approx(s0.particles[2].position[0], 8.0);
  approx(s0.particles[2].fitness, -15.0);
  approx(s0.gbestPosition[0], 1.0);
  approx(s0.gbestFitness, 6.0);

  // Iteration 1 - Step P1
  engine.stepParticle();
  const sP1 = engine.getState();
  approx(sP1.particles[0].velocity[0], 3.75);
  approx(sP1.particles[0].position[0], -0.25);
  approx(sP1.particles[0].fitness, -0.5625);
  approx(sP1.particles[0].pbestPosition[0], -0.25);

  // Step P2
  engine.stepParticle();
  const sP2 = engine.getState();
  approx(sP2.particles[1].velocity[0], 0.0);
  approx(sP2.particles[1].position[0], 1.0);
  approx(sP2.particles[1].fitness, 6.0);

  // Step P3
  engine.stepParticle();
  const sP3 = engine.getState();
  approx(sP3.particles[2].velocity[0], -9.345);
  approx(sP3.particles[2].position[0], -1.345);
  approx(sP3.particles[2].fitness, -8.879);
  approx(sP3.gbestPosition[0], 1.0);
  approx(sP3.gbestFitness, 6.0);

  // Iteration 2
  engine.stepIteration();
  const sIter2 = engine.getState();
  // P1 reached 2.6937 with f=9.9062, becomes new gbest!
  approx(sIter2.particles[0].position[0], 2.6937);
  approx(sIter2.particles[0].fitness, 9.9062);
  approx(sIter2.gbestPosition[0], 2.6937);
  approx(sIter2.gbestFitness, 9.9062);

  // Iteration 3
  engine.stepIteration();
  const sIter3 = engine.getState();
  // P2 reached 2.9308 with f=9.9952, becomes new gbest!
  approx(sIter3.particles[1].position[0], 2.9308);
  approx(sIter3.particles[1].fitness, 9.9952);
  approx(sIter3.gbestPosition[0], 2.9308);
  approx(sIter3.gbestFitness, 9.9952);

  console.log('✓ Problem 3: Lecture hand calculation exact match verified (Iter 0-3)');
}

console.log('ALL LECTURE REPLAY VALIDATION TESTS PASSED!\n');
