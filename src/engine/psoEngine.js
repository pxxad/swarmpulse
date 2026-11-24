/**
 * PSO Simulation Engine
 * Manages the swarm state, deterministic stepping, particle-by-particle updates,
 * step inspector breakdown, and complete rewind/fast-forward history.
 */

import { computeInertiaWeight, isBetter, getVelocityLimit, updateParticle } from './psoMath.js';
import { createPRNG } from './prng.js';
import { PROBLEMS } from './problems.js';

export function createPSOEngine(problemKey = 'problem1', userParams = {}) {
  const problem = PROBLEMS[problemKey] || PROBLEMS.problem1;
  const config = { ...problem.defaultParams, ...userParams };
  const prng = createPRNG(config.seed ?? 42);

  // Simulation state
  let currentIteration = 0;
  let activeParticleIndex = 0;
  let particles = [];
  let gbestPosition = null;
  let gbestFitness = null;
  let gbestParticleId = null;
  let iterationGbestPosition = null;
  let iterationGbestFitness = null;
  let iterationGbestParticleId = null;
  let history = []; // array of iteration snapshots
  let lastBreakdown = null;
  let isCompleted = false;

  function init() {
    currentIteration = 0;
    activeParticleIndex = 0;
    lastBreakdown = null;
    isCompleted = false;

    const dim = problem.dimensions;
    const [lo, hi] = problem.bounds;
    const N = config.swarmSize;
    const vMax = getVelocityLimit(problem.bounds, config.clampPercent, config.useVelocityClamp);

    particles = [];

    for (let i = 0; i < N; i++) {
      let position = [];
      let velocity = [];

      // If initial preset is specified (e.g. Problems 1 & 3 lecture hand calculations)
      if (config.initialPositions && config.initialPositions[i] !== undefined) {
        const pVal = config.initialPositions[i];
        position = Array.isArray(pVal) ? [...pVal] : [pVal];
      } else {
        // Random uniformly distributed in bounds
        for (let d = 0; d < dim; d++) {
          position.push(prng.uniform(lo, hi));
        }
      }

      // Initial velocity
      if (config.initialVelocities && config.initialVelocities[i] !== undefined) {
        const vVal = config.initialVelocities[i];
        velocity = Array.isArray(vVal) ? [...vVal] : [vVal];
      } else if (vMax !== null) {
        // Random velocity within at most 10% of range (0.5 * vMax) as per lecture notes
        const maxInitV = 0.5 * vMax;
        for (let d = 0; d < dim; d++) {
          velocity.push(prng.uniform(-maxInitV, maxInitV));
        }
      } else {
        for (let d = 0; d < dim; d++) {
          velocity.push(0.0);
        }
      }

      const fitness = problem.evaluate(position);

      particles.push({
        id: `P${i + 1}`,
        index: i,
        position: [...position],
        velocity: [...velocity],
        fitness,
        pbestPosition: [...position],
        pbestFitness: fitness
      });
    }

    // Determine initial gbest
    gbestParticleId = particles[0].id;
    gbestPosition = [...particles[0].position];
    gbestFitness = particles[0].fitness;

    for (let i = 1; i < particles.length; i++) {
      if (isBetter(particles[i].fitness, gbestFitness, problem.goal)) {
        gbestParticleId = particles[i].id;
        gbestPosition = [...particles[i].position];
        gbestFitness = particles[i].fitness;
      }
    }

    // gbest locked for the current iteration (canonical synchronous PSO)
    iterationGbestPosition = [...gbestPosition];
    iterationGbestFitness = gbestFitness;
    iterationGbestParticleId = gbestParticleId;

    // Save initial snapshot
    history = [takeSnapshot('Initial swarm generation')];
  }

  function takeSnapshot(actionDescription = '') {
    const sumFitness = particles.reduce((acc, p) => acc + (p.fitness ?? 0), 0);
    const meanFitness = particles.length > 0 ? sumFitness / particles.length : 0;

    return {
      iteration: currentIteration,
      activeParticleIndex,
      actionDescription,
      particles: particles.map(p => ({
        ...p,
        position: [...p.position],
        velocity: [...p.velocity],
        pbestPosition: [...p.pbestPosition]
      })),
      gbestPosition: gbestPosition ? [...gbestPosition] : [],
      gbestFitness,
      gbestParticleId,
      iterationGbestPosition: iterationGbestPosition ? [...iterationGbestPosition] : [],
      iterationGbestFitness,
      iterationGbestParticleId,
      meanFitness,
      lastBreakdown: lastBreakdown ? JSON.parse(JSON.stringify(lastBreakdown)) : null,
      isCompleted
    };
  }

  function getLectureR(iteration, particleIndex) {
    if (!problem.lectureRandomDraws) return null;
    const iterDraws = problem.lectureRandomDraws[iteration];
    if (!iterDraws || !iterDraws[particleIndex]) return null;
    return [iterDraws[particleIndex]];
  }

  /**
   * Performs a single particle step (granular inspectable mode).
   */
  function stepParticle() {
    if (isCompleted || currentIteration >= config.maxIterations) {
      isCompleted = true;
      return false;
    }

    const currentW = computeInertiaWeight(currentIteration, config.maxIterations, config);
    const vMax = getVelocityLimit(problem.bounds, config.clampPercent, config.useVelocityClamp);

    // Particle to update
    const pIndex = activeParticleIndex;
    const currentP = particles[pIndex];
    if (!currentP) return false;

    // Determine r1, r2 (lecture hand calculation draws if preset, otherwise PRNG)
    const lectureR = getLectureR(currentIteration + 1, pIndex);

    // Canonical synchronous PSO: particles are pulled toward iterationGbestPosition
    const { updatedParticle, breakdown } = updateParticle(currentP, iterationGbestPosition, {
      w: currentW,
      c1: config.c1,
      c2: config.c2,
      bounds: problem.bounds,
      vMax,
      rValues: lectureR,
      prng,
      goal: problem.goal,
      evaluate: problem.evaluate
    });

    // Update particle in list
    particles[pIndex] = updatedParticle;

    breakdown.iterationGbest = {
      position: iterationGbestPosition ? [...iterationGbestPosition] : [],
      fitness: iterationGbestFitness,
      particleId: iterationGbestParticleId
    };
    breakdown.currentIteration = currentIteration;
    breakdown.improvedGbest = false;
    breakdown.gbestAfter = {
      fitness: gbestFitness,
      position: gbestPosition ? [...gbestPosition] : [],
      particleId: gbestParticleId
    };
    lastBreakdown = breakdown;

    // Advance active particle pointer
    activeParticleIndex++;
    let actionDesc = `Updated Particle ${currentP.id} (Iter ${currentIteration + 1})`;

    if (activeParticleIndex >= particles.length) {
      // End of iteration: update global best across the entire swarm
      let bestP = particles[0];
      for (let i = 1; i < particles.length; i++) {
        if (isBetter(particles[i].pbestFitness, bestP.pbestFitness, problem.goal)) {
          bestP = particles[i];
        }
      }

      let improvedGbest = false;
      if (isBetter(bestP.pbestFitness, gbestFitness, problem.goal)) {
        gbestFitness = bestP.pbestFitness;
        gbestPosition = [...bestP.pbestPosition];
        gbestParticleId = bestP.id;
        improvedGbest = true;
      }

      breakdown.improvedGbest = improvedGbest;
      breakdown.gbestAfter = {
        fitness: gbestFitness,
        position: gbestPosition ? [...gbestPosition] : [],
        particleId: gbestParticleId
      };

      // Lock new gbest for the upcoming iteration
      iterationGbestPosition = [...gbestPosition];
      iterationGbestFitness = gbestFitness;
      iterationGbestParticleId = gbestParticleId;

      activeParticleIndex = 0;
      currentIteration++;
      actionDesc = `Completed Iteration ${currentIteration} (gbest: ${gbestFitness.toFixed(4)})`;

      if (currentIteration >= config.maxIterations) {
        isCompleted = true;
        actionDesc = `Optimization finished after ${config.maxIterations} iterations`;
      }
    }

    history.push(takeSnapshot(actionDesc));
    return true;
  }

  /**
   * Advances by one complete iteration (all particles).
   */
  function stepIteration() {
    if (isCompleted || currentIteration >= config.maxIterations) {
      isCompleted = true;
      return false;
    }

    const startIter = currentIteration;
    while (!isCompleted && currentIteration === startIter) {
      stepParticle();
    }
    return true;
  }

  /**
   * Steps back one snapshot in history.
   */
  function prevStep() {
    if (history.length <= 1) return false;

    // Remove latest snapshot
    history.pop();
    const previous = history[history.length - 1];

    // Restore state from snapshot
    currentIteration = previous.iteration;
    activeParticleIndex = previous.activeParticleIndex;
    particles = previous.particles.map(p => ({
      ...p,
      position: [...p.position],
      velocity: [...p.velocity],
      pbestPosition: [...p.pbestPosition]
    }));
    gbestPosition = [...previous.gbestPosition];
    gbestFitness = previous.gbestFitness;
    gbestParticleId = previous.gbestParticleId;
    iterationGbestPosition = [...previous.iterationGbestPosition];
    iterationGbestFitness = previous.iterationGbestFitness;
    iterationGbestParticleId = previous.iterationGbestParticleId;
    lastBreakdown = previous.lastBreakdown;
    isCompleted = previous.isCompleted;

    return true;
  }

  /**
   * Fast forwards immediately to the final iteration.
   */
  function fastForward() {
    while (!isCompleted && currentIteration < config.maxIterations) {
      stepParticle();
    }
    isCompleted = true;
    return getState();
  }

  function reset() {
    init();
    return getState();
  }

  function getState() {
    const currentW = computeInertiaWeight(currentIteration, config.maxIterations, config);
    const sumFitness = particles.reduce((acc, p) => acc + p.fitness, 0);
    const meanFitness = sumFitness / (particles.length || 1);

    return {
      problem,
      config,
      currentIteration,
      activeParticleIndex,
      currentW,
      particles: particles.map(p => ({ ...p })),
      gbestPosition: gbestPosition ? [...gbestPosition] : [],
      gbestFitness,
      gbestParticleId,
      meanFitness,
      lastBreakdown,
      isCompleted,
      historyLength: history.length,
      history: history.map(h => ({
        iteration: h.iteration,
        gbestFitness: h.gbestFitness,
        meanFitness: h.meanFitness,
        actionDescription: h.actionDescription
      }))
    };
  }

  // Initialize engine
  init();

  return {
    problem,
    config,
    getState,
    stepParticle,
    stepIteration,
    prevStep,
    fastForward,
    reset
  };
}
