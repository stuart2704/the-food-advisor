import { useEffect, useMemo, useState } from 'react';

interface EventEntry {
  time: string;
  type: string;
  message: string;
  category?: string;
}

type Severity = 'info' | 'warn' | 'error';

interface LogEntry extends EventEntry {
  id: string;
  engine: string;
  severity: Severity;
}

interface LogGroup {
  key: string;
  label: string;
  logs: LogEntry[];
}

class EventFeedError extends Error {
  constructor(message: string, readonly status: number | null) {
    super(message);
    this.name = 'EventFeedError';
  }
}

async function getEvents(signal: AbortSignal): Promise<unknown> {
  try {
    const response = await fetch('/dashboard/events', {
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal,
    });
    if (response.status === 401 || response.status === 403) {
      throw new EventFeedError('Admin login required.', response.status);
    }
    if (!response.ok) {
      throw new EventFeedError('The event feed is temporarily unavailable.', response.status);
    }
    return await response.json() as unknown;
  } catch (error) {
    if (error instanceof EventFeedError || (error instanceof DOMException && error.name === 'AbortError')) {
      throw error;
    }
    throw new EventFeedError('Could not reach the event feed.', null);
  }
}

function isEvent(value: unknown): value is EventEntry {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<EventEntry>;
  return typeof event.time === 'string' && Number.isFinite(Date.parse(event.time))
    && typeof event.type === 'string' && typeof event.message === 'string'
    && (event.category === undefined || typeof event.category === 'string');
}

function toSeverity(type: string): Severity {
  const normalized = type.toLowerCase();
  if (normalized === 'error') return 'error';
  if (normalized === 'warning' || normalized === 'warn') return 'warn';
  return 'info';
}

function groupLogs(events: EventEntry[]): LogGroup[] {
  const groups = new Map<string, LogGroup>();

  events.forEach((event, index) => {
    const severity = toSeverity(event.type);
    const engine = event.category?.trim() || event.type.trim() || 'system';
    const minute = event.time.slice(0, 16);
    const key = `${minute}-${engine}-${severity}`;
    const localTime = new Date(event.time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const log: LogEntry = {
      ...event,
      id: `${event.time}-${event.type}-${index}`,
      engine,
      severity,
    };

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: `${localTime} — ${engine.toUpperCase()} — ${severity.toUpperCase()}`,
        logs: [],
      });
    }
    groups.get(key)?.logs.push(log);
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    logs: group.logs.sort((a, b) => b.time.localeCompare(a.time)),
  }));
}

function LogRow({ log }: { log: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyLog() {
    await navigator.clipboard.writeText(JSON.stringify({
      time: log.time,
      type: log.type,
      message: log.message,
      ...(log.category ? { category: log.category } : {}),
    }, null, 2));
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
            <time dateTime={log.time}>{new Date(log.time).toLocaleString()}</time>
            <span>{log.engine.toUpperCase()}</span>
          </span>
        </span>
        <span aria-hidden="true">{expanded ? '−' : '+'}</span>
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
          <button type="button" className="copy-log-button" onClick={() => void copyLog()}>
            {copied ? 'Copied' : 'Copy event'}
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
          {group.logs.map((log) => <LogRow key={log.id} log={log} />)}
        </div>
      )}
    </section>
  );
}

export function LiveEvents() {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const groups = useMemo(() => groupLogs(events), [events]);

  useEffect(() => {
    let disposed = false;
    let pending = false;
    let authBlocked = false;
    let controller: AbortController | undefined;

    async function loadEvents() {
      if (pending || disposed || authBlocked) return;
      pending = true;
      controller = new AbortController();
      try {
        const data = await getEvents(controller.signal);
        if (!Array.isArray(data) || data.length > 200 || !data.every(isEvent)) {
          throw new Error('The event feed returned an unexpected response.');
        }
        if (!disposed) {
          setEvents([...data].reverse());
          setError(null);
        }
      } catch (err) {
        if (!disposed) {
          if (err instanceof EventFeedError && (err.status === 401 || err.status === 403)) {
            authBlocked = true;
            setEvents([]);
          }
          setError(err instanceof Error && err.name !== 'AbortError'
            ? err.message : 'The event request timed out. Retrying automatically.');
        }
      } finally {
        pending = false;
        if (!disposed) setLoading(false);
      }
    }

    void loadEvents();
    const interval = window.setInterval(() => void loadEvents(), 3000);
    return () => {
      disposed = true;
      window.clearInterval(interval);
      controller?.abort();
    };
  }, []);

  return (
    <>
      {error && <p role="status" className="mb-3 text-sm text-destructive">{error}</p>}
      <div id="events" className="events-box" role="log" aria-live="polite" aria-label="Live events, newest first">
        {loading ? <p>Loading events…</p> : events.length === 0
          ? <p>{error ? 'Event feed unavailable.' : 'No events recorded yet.'}</p>
          : groups.map((group) => <LogGroupView key={group.key} group={group} />)}
      </div>
      {error && events.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Showing the last successfully loaded events.</p>}
    </>
  );
}