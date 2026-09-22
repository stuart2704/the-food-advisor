import { useEffect, useMemo, useState } from "react";

type HealthStatus = "healthy" | "degraded" | "error" | "unknown";

interface HealthCheck {
  status: HealthStatus;
  detail: string;
}

interface SystemHealthResponse {
  checkedAt: string;
  scope: "current_process";
  services: {
    ai: HealthCheck;
    automation: HealthCheck;
    queue: HealthCheck;
    api: HealthCheck;
    database: HealthCheck;
  };
}

const serviceLabels: Record<keyof SystemHealthResponse["services"], string> = {
  ai: "AI Engine",
  automation: "Automation",
  queue: "Queue",
  api: "API Layer",
  database: "Database"
};

function isHealthCheck(value: unknown): value is HealthCheck {
  if (!value || typeof value !== "object") return false;
  const check = value as Partial<HealthCheck>;
  return (
    ["healthy", "degraded", "error", "unknown"].includes(check.status ?? "") &&
    typeof check.detail === "string"
  );
}

function isSystemHealth(value: unknown): value is SystemHealthResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<SystemHealthResponse>;
  const services = response.services;
  return (
    typeof response.checkedAt === "string" &&
    Number.isFinite(Date.parse(response.checkedAt)) &&
    response.scope === "current_process" &&
    Boolean(
      services &&
        isHealthCheck(services.ai) &&
        isHealthCheck(services.automation) &&
        isHealthCheck(services.queue) &&
        isHealthCheck(services.api) &&
        isHealthCheck(services.database)
    )
  );
}

export function SystemHealth() {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let pending = false;
    let controller: AbortController | undefined;

    async function loadHealth() {
      if (disposed || pending) return;
      pending = true;
      controller = new AbortController();
      try {
        const response = await fetch("/dashboard/system-health", {
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error("Live system health is unavailable.");
        }
        const data = (await response.json()) as unknown;
        if (!isSystemHealth(data)) {
          throw new Error("System health returned an unexpected response.");
        }
        if (!disposed) {
          setHealth(data);
          setError(null);
        }
      } catch (caught) {
        if (
          !disposed &&
          !(caught instanceof DOMException && caught.name === "AbortError")
        ) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Live system health is unavailable."
          );
        }
      } finally {
        pending = false;
      }
    }

    void loadHealth();
    const interval = window.setInterval(() => void loadHealth(), 15_000);
    return () => {
      disposed = true;
      window.clearInterval(interval);
      controller?.abort();
    };
  }, []);

  const services = health
    ? (Object.entries(health.services) as Array<
        [keyof SystemHealthResponse["services"], HealthCheck]
      >)
    : [];
  const summary = useMemo(() => {
    if (!health) return error ? "Checks unavailable" : "Checking services";
    const unhealthy = services.filter(
      ([, check]) => check.status !== "healthy"
    ).length;
    return unhealthy === 0
      ? "All reported checks healthy"
      : `${unhealthy} check${unhealthy === 1 ? "" : "s"} need attention`;
  }, [error, health, services]);

  return (
    <section className="system-health" aria-labelledby="system-health-title">
      <div className="system-health-heading">
        <div>
          <p className="system-health-eyebrow">Operations</p>
          <h2 id="system-health-title">System Health</h2>
        </div>
        <span className="system-health-summary">{summary}</span>
      </div>
      <p className="system-health-description">
        Live, admin-only checks refresh every 15 seconds. Queue status remains
        unknown until real depth telemetry is available.
      </p>
      <ul>
        {health ? (
          services.map(([key, check]) => (
            <li key={key} title={check.detail}>
              <span>{serviceLabels[key]}</span>
              <span className={`system-health-status status-${check.status}`}>
                <span className="system-health-dot" aria-hidden="true" />
                {check.status}
              </span>
            </li>
          ))
        ) : (
          <li className="system-health-message">
            {error ?? "Loading system health…"}
          </li>
        )}
      </ul>
      {health && (
        <p className="system-health-updated">
          Checked {new Date(health.checkedAt).toLocaleTimeString()}
        </p>
      )}
    </section>
  );
}