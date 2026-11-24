/**
 * Mathematical operations for Particle Swarm Optimization (PSO).
 * Implements the standard canonical velocity & position equations,
 * dynamic inertia decay, velocity clamping, and boundary containment.
 */

/**
 * Computes current inertia weight w at iteration t.
 */
export function computeInertiaWeight(iteration, maxIterations, config) {
  if (config.inertiaType === 'decay') {
    const w0 = config.inertiaStart ?? 0.9;
    const w1 = config.inertiaEnd ?? 0.4;
    const maxT = Math.max(1, (maxIterations ?? 100) - 1);
    const progress = Math.min(1, Math.max(0, iteration / maxT));
    return w0 - (w0 - w1) * progress;
  }
  return config.inertiaWeight ?? 0.7;
}

/**
 * Checks whether fitness A is better than fitness B based on optimization goal.
 */
export function isBetter(valA, valB, goal = 'minimize') {
  if (valB === undefined || valB === null) return true;
  if (valA === undefined || valA === null) return false;
  return goal === 'minimize' ? valA < valB : valA > valB;
}

/**
 * Computes velocity limit from bounds and clamp percentage.
 */
export function getVelocityLimit(bounds, clampPercent = 20, enabled = true) {
  if (!enabled || !clampPercent || clampPercent <= 0) return null;
  const range = bounds[1] - bounds[0];
  return (clampPercent / 100) * range;
}

/**
 * Updates a single particle's velocity and position for all dimensions,
 * returning both the updated particle state and a detailed mathematical breakdown.
 */
export function updateParticle(particle, gbestPosition, options) {
  const {
    w,
    c1,
    c2,
    bounds,
    vMax,
    rValues, // array of { r1, r2 } per dimension, or null for generated
    prng,
    goal,
    evaluate
  } = options;

  const dim = particle.position.length;
  const oldPosition = [...particle.position];
  const oldVelocity = [...particle.velocity];
  const newVelocity = [];
  const newPosition = [];
  const breakdownDimensions = [];

  for (let d = 0; d < dim; d++) {
    const x_d = oldPosition[d];
    const v_d = oldVelocity[d] ?? 0;
    const p_d = particle.pbestPosition && particle.pbestPosition[d] !== undefined ? particle.pbestPosition[d] : x_d;
    const g_d = gbestPosition && gbestPosition[d] !== undefined ? gbestPosition[d] : x_d;

    // Determine random numbers r1, r2
    let r1 = rValues && rValues[d] ? rValues[d].r1 : (prng ? prng.next() : Math.random());
    let r2 = rValues && rValues[d] ? rValues[d].r2 : (prng ? prng.next() : Math.random());

    // 1. Velocity components
    const inertiaTerm = w * v_d;
    const cognitiveDelta = p_d - x_d;
    const cognitiveTerm = c1 * r1 * cognitiveDelta;
    const socialDelta = g_d - x_d;
    const socialTerm = c2 * r2 * socialDelta;

    const rawNewV = inertiaTerm + cognitiveTerm + socialTerm;

    // Velocity Clamping
    let finalV = rawNewV;
    let wasClamped = false;
    if (vMax !== null && vMax !== undefined) {
      if (finalV > vMax) {
        finalV = vMax;
        wasClamped = true;
      } else if (finalV < -vMax) {
        finalV = -vMax;
        wasClamped = true;
      }
    }

    // 2. Position update & Boundary clipping
    const rawNewX = x_d + finalV;
    let finalX = rawNewX;
    let wasClipped = false;
    const [lo, hi] = bounds;

    if (finalX < lo) {
      finalX = lo;
      wasClipped = true;
    } else if (finalX > hi) {
      finalX = hi;
      wasClipped = true;
    }

    newVelocity.push(finalV);
    newPosition.push(finalX);

    breakdownDimensions.push({
      dimIndex: d,
      xOld: x_d,
      vOld: v_d,
      pbest: p_d,
      gbest: g_d,
      r1,
      r2,
      w,
      c1,
      c2,
      inertiaTerm,
      cognitiveDelta,
      cognitiveTerm,
      socialDelta,
      socialTerm,
      rawNewV,
      finalV,
      wasClamped,
      vMax,
      rawNewX,
      finalX,
      wasClipped,
      bounds
    });
  }

  // 3. Fitness evaluation & personal best update
  const newFitness = evaluate(newPosition);
  const oldFitness = particle.fitness;
  const oldPbestFitness = particle.pbestFitness;
  const improvedPbest = isBetter(newFitness, oldPbestFitness, goal);

  const updatedPbestPosition = improvedPbest ? [...newPosition] : [...particle.pbestPosition];
  const updatedPbestFitness = improvedPbest ? newFitness : oldPbestFitness;

  return {
    updatedParticle: {
      id: particle.id,
      position: newPosition,
      velocity: newVelocity,
      fitness: newFitness,
      pbestPosition: updatedPbestPosition,
      pbestFitness: updatedPbestFitness
    },
    breakdown: {
      particleId: particle.id,
      oldPosition,
      oldVelocity,
      oldFitness,
      newPosition,
      newVelocity,
      newFitness,
      oldPbestPosition: [...particle.pbestPosition],
      oldPbestFitness,
      newPbestPosition: updatedPbestPosition,
      newPbestFitness: updatedPbestFitness,
      improvedPbest,
      dimensions: breakdownDimensions
    }
  };
}
