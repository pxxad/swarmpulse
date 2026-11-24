/**
 * Benchmark Optimization Problems for PSO
 * Defined as in the lecture notes:
 * 1. f(x) = x^2 (1D Minimization)
 * 2. Rastrigin 2D (2D Multimodal Minimization)
 * 3. f(x) = 10 - (x - 3)^2 (1D Maximization)
 * 4. Peaks 2D (2D Multimodal Maximization)
 */

export const PROBLEMS = {
  problem1: {
    id: 'problem1',
    name: 'Problem 1: Sphere Bowl (1-D)',
    category: '1-D Minimization',
    goal: 'minimize',
    difficulty: 'Easy',
    dimensions: 1,
    formulaLatex: 'f(x) = x^2',
    description: 'Single smooth parabolic bowl with a unique global minimum at x = 0. Perfect for hand calculation and tracking every arithmetic operation.',
    bounds: [-5, 5],
    knownOptimum: {
      position: [0],
      value: 0
    },
    defaultParams: {
      swarmSize: 3,
      maxIterations: 30,
      inertiaType: 'fixed', // 'fixed' | 'decay'
      inertiaWeight: 0.7,
      inertiaStart: 0.7,
      inertiaEnd: 0.7,
      c1: 1.5,
      c2: 1.5,
      useVelocityClamp: false,
      clampPercent: 20,
      initialPositions: [4.0, -3.0, 2.0],
      initialVelocities: [0.0, 0.0, 0.0],
      isLecturePreset: true
    },
    // Exact r1, r2 values from the lecture notes (iterations 1, 2, 3)
    lectureRandomDraws: {
      1: [
        { r1: 0.61, r2: 0.86 }, // P1
        { r1: 0.75, r2: 0.25 }, // P2
        { r1: 0.32, r2: 0.84 }  // P3
      ],
      2: [
        { r1: 0.05, r2: 0.79 }, // P1
        { r1: 0.77, r2: 0.47 }, // P2
        { r1: 0.32, r2: 0.30 }  // P3
      ],
      3: [
        { r1: 0.28, r2: 0.45 }, // P1
        { r1: 0.50, r2: 0.55 }, // P2
        { r1: 0.95, r2: 0.76 }  // P3
      ]
    },
    evaluate: (x) => {
      const val = Array.isArray(x) ? x[0] : x;
      return val * val;
    }
  },

  problem2: {
    id: 'problem2',
    name: 'Problem 2: Rastrigin Surface (2-D)',
    category: '2-D Minimization',
    goal: 'minimize',
    difficulty: 'Hard',
    dimensions: 2,
    formulaLatex: 'f(x_1, x_2) = 20 + (x_1^2 - 10\\cos 2\\pi x_1) + (x_2^2 - 10\\cos 2\\pi x_2)',
    description: 'Highly multimodal benchmark with a regular grid of 121 local minima inside the box [-5.12, 5.12]^2. Requires decaying inertia to escape local valleys and settle on (0, 0).',
    bounds: [-5.12, 5.12],
    knownOptimum: {
      position: [0, 0],
      value: 0
    },
    defaultParams: {
      swarmSize: 30,
      maxIterations: 100,
      inertiaType: 'decay',
      inertiaWeight: 0.9,
      inertiaStart: 0.9,
      inertiaEnd: 0.4,
      c1: 2.0,
      c2: 2.0,
      useVelocityClamp: true,
      clampPercent: 20, // 20% of range = 0.2 * 10.24 = 2.048
      isLecturePreset: true
    },
    evaluate: (coords) => {
      const x1 = coords[0];
      const x2 = coords[1];
      return 20 + (x1 * x1 - 10 * Math.cos(2 * Math.PI * x1)) + (x2 * x2 - 10 * Math.cos(2 * Math.PI * x2));
    }
  },

  problem3: {
    id: 'problem3',
    name: 'Problem 3: Inverted Parabola (1-D)',
    category: '1-D Maximization',
    goal: 'maximize',
    difficulty: 'Easy',
    dimensions: 1,
    formulaLatex: 'f(x) = 10 - (x - 3)^2',
    description: 'Inverted parabolic curve with peak at x = 3, f(x) = 10. Illustrates maximization behavior where personal best and global best update when f(x) increases.',
    bounds: [-10, 10],
    knownOptimum: {
      position: [3],
      value: 10
    },
    defaultParams: {
      swarmSize: 3,
      maxIterations: 30,
      inertiaType: 'fixed',
      inertiaWeight: 0.7,
      inertiaStart: 0.7,
      inertiaEnd: 0.7,
      c1: 1.5,
      c2: 1.5,
      useVelocityClamp: false,
      clampPercent: 20,
      initialPositions: [-4.0, 1.0, 8.0],
      initialVelocities: [0.0, 0.0, 0.0],
      isLecturePreset: true
    },
    lectureRandomDraws: {
      1: [
        { r1: 0.17, r2: 0.50 }, // P1
        { r1: 0.59, r2: 0.08 }, // P2
        { r1: 0.18, r2: 0.89 }  // P3
      ],
      2: [
        { r1: 0.11, r2: 0.17 }, // P1
        { r1: 0.90, r2: 0.61 }, // P2
        { r1: 0.38, r2: 0.51 }  // P3
      ],
      3: [
        { r1: 0.65, r2: 0.30 }, // P1
        { r1: 0.17, r2: 0.76 }, // P2
        { r1: 0.65, r2: 0.51 }  // P3
      ]
    },
    evaluate: (x) => {
      const val = Array.isArray(x) ? x[0] : x;
      return 10 - Math.pow(val - 3, 2);
    }
  },

  problem4: {
    id: 'problem4',
    name: 'Problem 4: Peaks Landscape (2-D)',
    category: '2-D Maximization',
    goal: 'maximize',
    difficulty: 'Hard',
    dimensions: 2,
    formulaLatex: 'f(x, y) = 3(1-x)^2 e^{-x^2-(y+1)^2} - 10(\\frac{x}{5}-x^3-y^5)e^{-x^2-y^2} - \\frac{1}{3}e^{-(x+1)^2-y^2}',
    description: 'Multimodal mountain terrain with 3 separate peaks. Global maximum is f ≈ 8.106 near (-0.01, 1.58), with two misleading sub-peaks at f ≈ 3.78 and f ≈ 3.59.',
    bounds: [-3, 3],
    knownOptimum: {
      position: [-0.01, 1.58],
      value: 8.1062
    },
    defaultParams: {
      swarmSize: 30,
      maxIterations: 100,
      inertiaType: 'decay',
      inertiaWeight: 0.9,
      inertiaStart: 0.9,
      inertiaEnd: 0.4,
      c1: 2.0,
      c2: 2.0,
      useVelocityClamp: true,
      clampPercent: 20, // 20% of range = 0.2 * 6 = 1.2
      isLecturePreset: true
    },
    evaluate: (coords) => {
      const x = coords[0];
      const y = coords[1];
      const term1 = 3 * Math.pow(1 - x, 2) * Math.exp(-Math.pow(x, 2) - Math.pow(y + 1, 2));
      const term2 = 10 * (x / 5 - Math.pow(x, 3) - Math.pow(y, 5)) * Math.exp(-Math.pow(x, 2) - Math.pow(y, 2));
      const term3 = (1 / 3) * Math.exp(-Math.pow(x + 1, 2) - Math.pow(y, 2));
      return term1 - term2 - term3;
    }
  }
};
