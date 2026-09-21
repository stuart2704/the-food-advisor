import { useState } from "react";

export default function OwnerDashboard() {
  const [seoText, setSeoText] = useState("");
  const [loading, setLoading] = useState(false);

  function generateSEO() {
    setLoading(true);

    fetch("https://the-food-advisor-api.onrender.com/ai/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Your Restaurant Name",
        city: "Your City",
        cuisine: "Your Cuisine",
        rating: 4.7
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "SEO text could not be generated.");
        }
        return data;
      })
      .then(data => setSeoText(data.seo))
      .catch(() => setSeoText("SEO text could not be generated right now."))
      .finally(() => setLoading(false));
  }

  return (
    <div className="section">
      <h1>Restaurant Owner Dashboard</h1>
      <p>Manage your listing, add photos, menus, opening hours, and more.</p>

      <div
        style={{
          marginTop: "40px",
          background: "#fff",
          padding: "24px",
          borderRadius: "16px"
        }}
      >
        <h2>AI‑Generated SEO Text</h2>
        <p>Boost your visibility on Google with AI‑optimised content.</p>

        <button
          onClick={generateSEO}
          disabled={loading}
          style={{
            padding: "12px 20px",
            background: "#d94800",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            cursor: loading ? "wait" : "pointer",
            marginTop: "12px",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Generating…" : "Generate SEO Text"}
        </button>

        {seoText && (
          <div
            style={{
              marginTop: "24px",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6"
            }}
          >
            {seoText}
          </div>
        )}
      </div>
    </div>
  );
}