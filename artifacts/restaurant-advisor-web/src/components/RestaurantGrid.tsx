import { useEffect, useState } from "react";
import RestaurantCard from "./RestaurantCard";
import SearchFilters from "./SearchFilters";

export default function RestaurantGrid() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [rating, setRating] = useState("");

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

  const normalizedSearch = search.trim().toLowerCase();
  const minimumRating = rating ? Number(rating) : 0;
  const filteredRestaurants = restaurants.filter((restaurant: any) => {
    const types = Array.isArray(restaurant.types) ? restaurant.types : [];
    const searchableText = [
      restaurant.name,
      restaurant.city,
      ...types
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
      (!city || restaurant.city === city) &&
      (!cuisine || types.includes(cuisine)) &&
      (!minimumRating || Number(restaurant.rating) >= minimumRating)
    );
  });

  return (
    <div className="section">
      <SearchFilters
        search={search}
        setSearch={setSearch}
        city={city}
        setCity={setCity}
        cuisine={cuisine}
        setCuisine={setCuisine}
        rating={rating}
        setRating={setRating}
      />

      <div className="grid">
        {filteredRestaurants.map((r: any) => (
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

      {filteredRestaurants.length === 0 && (
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          No restaurants match these filters.
        </p>
      )}
    </div>
  );
}