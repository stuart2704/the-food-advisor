import { useMemo, useState } from "react";
import { useLogStream, type LogEvent } from "../../hooks/useLogStream";

type Severity = "info" | "warn" | "error";

interface LogEntry extends LogEvent {
  id: string;
  engine: string;
  severity: Severity;
}

interface LogGroup {
  key: string;
  label: string;
  logs: LogEntry[];
}

function toSeverity(type: string): Severity {
  const normalized = type.toLowerCase();
  if (normalized === "error") return "error";
  if (normalized === "warning" || normalized === "warn") return "warn";
  return "info";
}

function groupLogs(events: LogEvent[]): LogGroup[] {
  const groups = new Map<string, LogGroup>();

  events.forEach((event, index) => {
    const severity = toSeverity(event.type);
    const engine = event.category?.trim() || event.type.trim() || "system";
    const minute = event.time.slice(0, 16);
    const key = `${minute}-${engine}-${severity}`;
    const localTime = new Date(event.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
    const log: LogEntry = {
      ...event,
      id: `${event.time}-${event.type}-${index}`,
      engine,
      severity
    };

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: `${localTime} — ${engine.toUpperCase()} — ${severity.toUpperCase()}`,
        logs: []
      });
    }
    groups.get(key)?.logs.push(log);
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    logs: group.logs.sort((a, b) => b.time.localeCompare(a.time))
  }));
}

function LogRow({ log }: { log: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyLog() {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          time: log.time,
          type: log.type,
          message: log.message,
          ...(log.category ? { category: log.category } : {})
        },
        null,
        2
      )
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`log-row log-row-${log.severity}`}>
      <button
        type="button"
        className="log-row-main"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="severity-dot" aria-label={`${log.severity} severity`} />
        <span className="log-row-content">
          <span className="log-row-summary">{log.message}</span>
          <span className="log-row-meta">
            <time dateTime={log.time}>
              {new Date(log.time).toLocaleString()}
            </time>
            <span>{log.engine.toUpperCase()}</span>
          </span>
        </span>
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="log-row-expansion">
          <dl>
            <dt>Type</dt>
            <dd>{log.type}</dd>
            {log.category && (
              <>
                <dt>Category</dt>
                <dd>{log.category}</dd>
              </>
            )}
            <dt>UTC</dt>
            <dd>{log.time}</dd>
          </dl>
          <button
            type="button"
            className="copy-log-button"
            onClick={() => void copyLog()}
          >
            {copied ? "Copied" : "Copy event"}
          </button>
        </div>
      )}
    </div>
  );
}

function LogGroupView({ group }: { group: LogGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="log-group">
      <button
        type="button"
        className="log-group-header"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{group.label}</span>
        <span className="log-group-count">{group.logs.length}</span>
      </button>
      {open && (
        <div className="log-group-body">
          {group.logs.map((log) => (
            <LogRow key={log.id} log={log} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function LogViewer() {
  const { events, loading, error } = useLogStream();
  const groups = useMemo(() => groupLogs(events), [events]);

  return (
    <>
      {error && (
        <p role="status" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div
        id="events"
        className="events-box"
        role="log"
        aria-live="polite"
        aria-label="Live events, newest first"
      >
        {loading ? (
          <p>Loading events…</p>
        ) : events.length === 0 ? (
          <p>{error ? "Event feed unavailable." : "No events recorded yet."}</p>
        ) : (
          groups.map((group) => (
            <LogGroupView key={group.key} group={group} />
          ))
        )}
      </div>
      {error && events.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Showing the last successfully loaded events.
        </p>
      )}
    </>
  );
}