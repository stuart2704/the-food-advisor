import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    fetch("https://the-food-advisor-api.onrender.com/api/restaurants")
      .then(res => res.json())
      .then(data => {
        const match = data.find((r: any) => r.id === id);
        setRestaurant(match);
      });
  }, [id]);

  if (!restaurant) {
    return <div className="section">Loading…</div>;
  }

  return (
    <div className="section" style={{ maxWidth: "900px" }}>
      <img
        src={`https://source.unsplash.com/900x500/?restaurant,${restaurant.city}`}
        alt={restaurant.name}
        style={{
          width: "100%",
          height: "400px",
          objectFit: "cover",
          borderRadius: "16px",
          marginBottom: "24px"
        }}
      />

      <h1 style={{ fontSize: "2.2rem", marginBottom: "10px" }}>
        {restaurant.name}
      </h1>

      <div style={{ fontSize: "1.1rem", opacity: 0.8, marginBottom: "20px" }}>
        {restaurant.address}, {restaurant.city}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <strong>Rating:</strong> {restaurant.rating} ⭐
      </div>

      <div style={{ marginBottom: "20px" }}>
        <strong>Website:</strong>{" "}
        <a href={restaurant.website} target="_blank" rel="noreferrer">
          {restaurant.website}
        </a>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <strong>Google Maps:</strong>{" "}
        <a href={restaurant.googleMapsUrl} target="_blank" rel="noreferrer">
          View on Maps
        </a>
      </div>

      <div style={{ marginTop: "40px", opacity: 0.7 }}>
        <em>More features coming soon…</em>
      </div>
    </div>
  );
}