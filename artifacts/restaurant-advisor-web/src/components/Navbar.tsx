import { useState } from "react";
import { Link } from "react-router-dom";

const navigation = [
  { to: "/", label: "Home" },
  { to: "/trending", label: "Trending" },
  { to: "/city-guide", label: "City Food Guide" },
  { to: "/owner", label: "For Restaurants" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label="Main navigation"
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 999,
        borderBottom: "1px solid #eee",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
      }}
    >
      <Link
        to="/"
        onClick={() => setOpen(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none"
        }}
      >
        <img
          src="/logo.png"
          alt=""
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px"
          }}
        />
        <span
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#d94800"
          }}
        >
          The Food Advisor
        </span>
      </Link>

      <div className="desktop-menu">
        {navigation.map((item) => (
          <Link className="nav-link" to={item.to} key={item.to}>
            {item.label}
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="hamburger"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "×" : "☰"}
      </button>

      {open && (
        <div
          id="mobile-navigation"
          className="mobile-menu"
          style={{
            position: "absolute",
            top: "72px",
            right: "16px",
            background: "#fff",
            width: "220px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "16px",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          {navigation.map((item) => (
            <Link
              className="nav-link"
              to={item.to}
              key={item.to}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <style>
        {`
          .desktop-menu {
            display: flex;
            align-items: center;
            gap: 24px;
            font-size: 1rem;
          }

          .nav-link {
            color: #333;
            font-weight: 500;
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .nav-link:hover,
          .nav-link:focus-visible {
            color: #d94800;
          }

          .hamburger {
            display: none;
            padding: 6px 10px;
            border: 0;
            background: transparent;
            color: #333;
            cursor: pointer;
            font-size: 1.8rem;
            line-height: 1;
          }

          .mobile-menu {
            display: none;
          }

          @media (max-width: 768px) {
            .desktop-menu {
              display: none;
            }

            .hamburger {
              display: block;
            }

            .mobile-menu {
              display: flex;
            }
          }
        `}
      </style>
    </nav>
  );
}