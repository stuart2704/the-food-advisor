export default function NavBar() {
  return (
    <nav
      style={{
        width: "100%",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src="/logo.png"
          alt="The Food Advisor Logo"
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
      </div>

      {/* Links */}
      <div style={{ display: "flex", gap: "24px", fontSize: "1rem" }}>
        <a href="/" style={{ textDecoration: "none", color: "#333" }}>
          Home
        </a>
        <a href="/restaurants" style={{ textDecoration: "none", color: "#333" }}>
          Restaurants
        </a>
        <a href="/about" style={{ textDecoration: "none", color: "#333" }}>
          About
        </a>
        <a href="/contact" style={{ textDecoration: "none", color: "#333" }}>
          Contact
        </a>
      </div>
    </nav>
  );
}