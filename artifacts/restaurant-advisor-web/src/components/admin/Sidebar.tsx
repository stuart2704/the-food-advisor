import { Link } from "react-router-dom";

const sections = ["Queue", "Engines", "Health"];

export function Sidebar() {
  return (
    <aside
      className="admin-system-navigation"
      style={{
        position: "sticky",
        top: "24px",
        alignSelf: "start",
        padding: "20px 14px",
        border: "1px solid #292929",
        borderRadius: "12px",
        background: "#151515"
      }}
    >
      <div
        style={{
          margin: "0 8px 12px",
          color: "#ff8b47",
          fontSize: "0.78rem",
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase"
        }}
      >
        System
      </div>
      <nav aria-label="System administration">
        <Link
          to="/admin/logs"
          aria-current="page"
          style={{
            display: "block",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "#d94800",
            color: "#fff",
            fontWeight: 700,
            textDecoration: "none"
          }}
        >
          Logs
        </Link>
        {sections.map((section) => (
          <button
            key={section}
            type="button"
            disabled
            title={`${section} is not available yet`}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: 0,
              borderRadius: "8px",
              background: "transparent",
              color: "#777",
              textAlign: "left",
              font: "inherit",
              fontWeight: 500,
              cursor: "not-allowed"
            }}
          >
            {section}
          </button>
        ))}
      </nav>
    </aside>
  );
}