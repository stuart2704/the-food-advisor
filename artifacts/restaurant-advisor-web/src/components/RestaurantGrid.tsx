import { useEffect, useState } from "react";
import RestaurantCard from "./RestaurantCard";

export default function RestaurantGrid() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://the-food-advisor-api.onrender.com/api/restaurants")
      .then(res => res.json())
      .then(data => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("API error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="section">Loading restaurants…</div>;
  }

  return (
    <div className="section">
      <div className="grid">
        {restaurants.map((r: any) => (
          <RestaurantCard
            key={r.id}
            id={r.id}
            name={r.name}
            city={r.city}
            cuisine={r.types?.[0] || "Restaurant"}
            image={`https://source.unsplash.com/600x400/?restaurant,${r.city}`}
          />
        ))}
      </div>
    </div>
  );
}