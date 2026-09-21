import RestaurantCard from "./RestaurantCard";
import { sampleRestaurants } from "../data/sampleRestaurants";

export default function RestaurantGrid() {
  return (
    <div className="section">
      <h2 style={{ marginBottom: "20px" }}>Featured Restaurants</h2>
      <div className="grid">
        {sampleRestaurants.map((r) => (
          <RestaurantCard key={r.name} {...r} />
        ))}
      </div>
    </div>
  );
}