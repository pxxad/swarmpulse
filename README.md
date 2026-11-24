# SwarmPulse — Particle Swarm Optimization (PSO) Lab

An interactive, publication-grade web application for exploring, visualizing, and analyzing **Particle Swarm Optimization (PSO)**. Built with React 18, Vite, and high-performance SVG/Canvas rendering, SwarmPulse offers complete pedagogical transparency into the algorithm's physics, vectors, personal memory, and swarm social dynamics.

---

## Overview

SwarmPulse models the biological flocking dynamics of PSO, translating mathematical updates into clear visual behaviors. The application reproduces the exact hand-calculated tables and multi-dimensional benchmark test cases from academic lecture notes.

### Core Mathematical Model

For each particle $i$ in dimension $d$ at iteration $t$:

1. **Velocity Update:**
   $$v_i(t+1) = w \cdot v_i(t) + c_1 \cdot r_1 \cdot [p_i - x_i(t)] + c_2 \cdot r_2 \cdot [g - x_i(t)]$$
   - **Inertia Pull ($w \cdot v$):** Preserves current velocity. Supports fixed weights or linear decay ($w_0 \to w_1$) to transition from global exploration to fine local exploitation.
   - **Cognitive Memory Pull ($c_1 \cdot r_1 \cdot [p - x]$):** Attracts the particle toward its personal historical best position $p_i$.
   - **Social Cooperation Pull ($c_2 \cdot r_2 \cdot [g - x]$):** Attracts the particle toward the swarm's collective global best position $g$.

2. **Position Update:**
   $$x_i(t+1) = x_i(t) + v_i(t+1)$$
   - Enforces optional velocity clamping ($v_{\max} = 20\%$ of variable range).
   - Enforces strict boundary containment via clipping to $[x_{\min}, x_{\max}]$.

---

## Supported Benchmark Problems

SwarmPulse comes pre-configured with four benchmark functions representing diverse optimization challenges:

| # | Problem | Objective Goal | Dimension | Default Swarm ($N$) | Iterations ($T$) | Known Theoretical Optimum | Landscape Characteristics |
|---|---|---|---|---|---|---|---|
| **1** | **Sphere Bowl** | Minimize | 1-D | 3 | 30 | $x^* = 0, f(x^*) = 0$ | Single unimodal smooth parabolic bowl $f(x) = x^2$ on $[-5, 5]$. Matches lecture hand-calculated iterations 1–5. |
| **2** | **Rastrigin Surface** | Minimize | 2-D | 30 | 100 | $(0, 0), f(x^*) = 0$ | Highly multimodal terrain with 121 local minima on $[-5.12, 5.12]^2$. Demonstrates escaping sub-optimal valleys via decaying inertia ($0.9 \to 0.4$). |
| **3** | **Inverted Parabola** | Maximize | 1-D | 3 | 30 | $x^* = 3, f(x^*) = 10$ | Maximization benchmark $f(x) = 10 - (x-3)^2$ on $[-10, 10]$ demonstrating personal and global best updates when fitness increases. |
| **4** | **Peaks Landscape** | Maximize | 2-D | 30 | 100 | $(-0.01, 1.58), f \approx 8.1062$ | Multimodal mountain terrain with 3 separate peaks on $[-3, 3]^2$. Tests avoidance of false local hills ($f \approx 3.78$ and $f \approx 3.59$). |

---

## Key Features

- **Granular Stepper:**
  - **Single Particle Mode:** Step particle-by-particle to observe individual vector calculations.
  - **Full Iteration Mode:** Advance all particles simultaneously by one generation.
  - **Previous Step (Rewind):** Step back to any previous state in the simulation history.
  - **Play / Pause:** Auto-step with real-time speed adjustment (50ms – 1000ms).
  - **Fast Forward:** Jump directly to the terminal iteration to inspect final convergence.
- **Step Math Inspector:**
  - **Summary View:** Real-time coordinates, velocity vectors, boundary clipping notices, velocity clamping alerts, and personal/global record update flags.
  - **Math Breakdown View:** Full scalar decomposition for every dimension showing exact products ($w \cdot v$, $c_1 \cdot r_1 \cdot \Delta p$, $c_2 \cdot r_2 \cdot \Delta g$).
- **Dual Visualizer Engine:**
  - **1-D Mode:** SVG curve plotting $f(x)$, particle nodes, velocity vector arrows, active halos, and global best reticle ($g^*$).
  - **2-D Mode:** 500x500 contour elevation heatmap canvas with real-time particle scatter, velocity heading lines, and leader indicators.
- **Swarm Registry & Convergence Profile:**
  - Complete tabular view showing ID, position vector, velocity vector, current fitness, personal best, and swarm status (`Leader`, `Active`, `Exploring`).
  - Real-time chart comparing leader progress $f(g^*)$ against swarm diversity over time.
- **Multi-Seed Benchmark Evaluator:**
  - Runs 20 independent trials with varying PRNG seeds to compute empirical mean final fitness, standard deviation ($\sigma$), and best trial.
- **IoT & Edge WSN Guidelines:**
  - Outlines memory footprints ($3 \times N \times D$ floats), compute budgets, and fixed-point compatibility for microcontroller deployment.

---

## Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
```bash
# Navigate to the project directory
cd project2-codebase

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5174/` (or the port indicated by Vite).

### Running Unit Tests
```bash
npm test
```
Executes two independent test suites:
1. `src/tests/psoEngine.test.js`: State machine integrity, stepping, rewind, and fast-forward mechanics.
2. `src/tests/lectureReplay.test.js`: Strict validation checking Problem 1 and Problem 3 calculations against the exact numbers in the lecture notes.

### Production Build
```bash
npm run build
```
Generates a production-ready, minified bundle in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

---

## Deploying to Vercel

SwarmPulse is configured for deployment on [Vercel](https://vercel.com).

### Option 1: Deploying via Vercel CLI

```bash
# Navigate to the project directory
cd project2-codebase

# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod
```

### Option 2: Deploying via Git Repository (Vercel Dashboard)

1. Connect your repository to Vercel.
2. If this codebase resides in a subfolder (e.g. `project2-codebase`), set the **Root Directory** in the Vercel project settings:
   - **Root Directory:** `project2-codebase`
3. Leave the build settings as default (automatically detected via `vercel.json`):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.

---

## Project Structure

```
project2-codebase/
├── dist/                      # Production build output
├── src/
│   ├── components/            # UI components
│   │   ├── BenchmarkView.jsx  # Multi-run evaluation and IoT guidance
│   │   ├── ConvergenceChart.jsx # Real-time leader vs mean convergence curve
│   │   ├── Navbar.jsx         # Clean header, SVG logo, and problem selector
│   │   ├── ParametersView.jsx # Swarm size, inertia decay, and coefficient controls
│   │   ├── SimulatorView.jsx  # Main simulation dashboard & stepper toolbar
│   │   ├── StepInspector.jsx  # Math breakdown & vector decomposition
│   │   ├── SwarmTable.jsx     # Swarm state registry table
│   │   ├── TheoryView.jsx     # Mathematical formulations & flocking analogies
│   │   ├── Visualizer1D.jsx   # 1-D SVG curve with velocity arrows
│   │   └── Visualizer2D.jsx   # 2-D contour heatmap canvas
│   ├── engine/                # Core simulation logic
│   │   ├── prng.js            # Mulberry32 deterministic pseudo-random generator
│   │   ├── problems.js        # Problem definitions, bounds, and lecture presets
│   │   ├── psoEngine.js       # Synchronous PSO state machine & history rewind
│   │   └── psoMath.js         # Velocity updates, inertia decay, and clamping
│   ├── styles/
│   │   └── theme.css          # Minimal scientific design tokens & responsive CSS
│   ├── tests/                 # Automated verification suites
│   │   ├── lectureReplay.test.js # Lecture hand-calculation validation
│   │   └── psoEngine.test.js     # Engine mechanics & boundary testing
│   ├── App.jsx                # Main application coordinator
│   └── main.jsx               # React DOM entry point
├── index.html                 # HTML shell with Google Fonts
├── package.json               # Project scripts and dependencies
├── vercel.json                # Vercel deployment configuration & SPA rewrites
├── vite.config.js             # Vite configuration
├── .gitignore                 # Standard git ignore rules
└── README.md                  # Project documentation
```

---

## License

MIT License. Designed for academic and educational exploration of Particle Swarm Optimization.
