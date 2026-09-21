import * as React from "react";
import { Layout } from "./components/Layout";
import { RestaurantCard } from "./components/RestaurantCard";
import { ToastContainer } from "./components/ToastContainer";
import { useToast } from "./hooks/use-toast";

const SAMPLE_RESTAURANTS = [
  { name: "Cardiff Kitchen", city: "Cardiff", cuisine: "Modern British" },
  { name: "Dragon Noodles", city: "Cardiff", cuisine: "Chinese" },
  { name: "Mediterraneo", city: "Cardiff", cuisine: "Mediterranean" }
];

export function App() {
  const { addToast } = useToast();

  const handleRecommendClick = (name: string) => {
    addToast({
      title: "Restaurant saved",
      description: `${name} added to your recommendations.`
    });
  };

  return (
    <>
      <Layout>
        <h1 style={{ marginBottom: 16 }}>Featured restaurants</h1>
        {SAMPLE_RESTAURANTS.map((r) => (
          <div key={r.name} style={{ marginBottom: 8 }}>
            <RestaurantCard {...r} />
            <button
              onClick={() => handleRecommendClick(r.name)}
              style={{
                marginTop: 6,
                background: "#2563eb",
                border: "none",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.85rem"
              }}
            >
              Recommend
            </button>
          </div>
        ))}
      </Layout>
      <ToastContainer />
    </>
  );
}