import React from 'react';

export default function SwarmTable({
  particles,
  gbestParticleId,
  activeParticleIndex,
  goal
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 className="card-title" style={{ margin: 0 }}>Swarm Particle State Registry</h3>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {particles.length} Particles Active
        </span>
      </div>
      <p className="card-subtitle">
        Current coordinates, velocities, individual fitness, and personal best historical coordinates.
      </p>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Position (x)</th>
              <th>Velocity (v)</th>
              <th>Current f(x)</th>
              <th>Personal Best (pbest)</th>
              <th>f(pbest)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {particles.map((p, idx) => {
              const isLeader = p.id === gbestParticleId;
              const isActive = idx === activeParticleIndex;

              let rowClass = '';
              if (isActive) rowClass = 'active-row';
              else if (isLeader) rowClass = 'leader-row';

              return (
                <tr key={p.id} className={rowClass}>
                  <td>
                    <strong>{p.id}</strong>
                  </td>
                  <td>[{p.position.map(n => n.toFixed(4)).join(', ')}]</td>
                  <td>[{p.velocity.map(n => n.toFixed(4)).join(', ')}]</td>
                  <td>{p.fitness.toFixed(4)}</td>
                  <td>[{p.pbestPosition.map(n => n.toFixed(4)).join(', ')}]</td>
                  <td>{p.pbestFitness.toFixed(4)}</td>
                  <td>
                    {isLeader ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#fef3c7',
                        color: '#b45309',
                        border: '1px solid #fde68a'
                      }}>
                        Leader
                      </span>
                    ) : isActive ? (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0'
                      }}>
                        Active
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-faint)', fontSize: '11px' }}>
                        Exploring
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
