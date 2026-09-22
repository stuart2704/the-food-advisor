import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/admin/Sidebar";
import { LiveEvents } from "../components/live-events";
import "./live-events.css";

export default function AdminLogs() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    document.title = "Operational Logs | The Food Advisor";
    const controller = new AbortController();

    void fetch("/auth/session", {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal
    })
      .then((response) => response.json() as Promise<{ authenticated?: boolean }>)
      .then((session) => {
        if (!session.authenticated) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setAuthenticated(true);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          navigate("/admin/login", { replace: true });
        }
      });

    return () => controller.abort();
  }, [navigate]);

  async function logout() {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    navigate("/admin/login", { replace: true });
  }

  if (!authenticated) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        Checking admin access…
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#e6e6e6",
        padding: "24px"
      }}
    >
      <div
        className="admin-logs-layout"
        style={{
          width: "min(1280px, 100%)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "180px minmax(0, 1fr)",
          gap: "28px"
        }}
      >
        <Sidebar />

        <section style={{ minWidth: 0 }}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "24px"
            }}
          >
            <div>
              <p style={{ color: "#ff8b47", fontWeight: 700, margin: 0 }}>
                The Food Advisor Admin
              </p>
              <h1 style={{ margin: "6px 0 0" }}>Operational Logs</h1>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              style={{
                padding: "9px 14px",
                border: "1px solid #444",
                borderRadius: "8px",
                background: "#222",
                color: "#eee",
                cursor: "pointer"
              }}
            >
              Sign out
            </button>
          </header>
          <p style={{ color: "#aaa", marginBottom: "16px" }}>
            Sanitized process-local events. The feed refreshes every three seconds
            and resets when the API process restarts.
          </p>
          <LiveEvents />
        </section>
      </div>
    </main>
  );
}