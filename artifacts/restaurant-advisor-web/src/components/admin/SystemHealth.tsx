const services = [
  "AI Engine",
  "Automation",
  "Queue",
  "API Layer",
  "Database"
] as const;

export function SystemHealth() {
  return (
    <section className="system-health" aria-labelledby="system-health-title">
      <div className="system-health-heading">
        <div>
          <p className="system-health-eyebrow">Operations</p>
          <h2 id="system-health-title">System Health</h2>
        </div>
        <span className="system-health-summary">Live checks pending</span>
      </div>
      <p className="system-health-description">
        Detailed service checks are not connected yet. No health state is being
        inferred from page availability.
      </p>
      <ul>
        {services.map((service) => (
          <li key={service}>
            <span>{service}</span>
            <span className="system-health-status">
              <span className="system-health-dot" aria-hidden="true" />
              Not connected
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}