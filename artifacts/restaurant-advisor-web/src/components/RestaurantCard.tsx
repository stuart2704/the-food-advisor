import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function RestaurantCard({ id, name, city, cuisine, image }: any) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`https://the-food-advisor-api.onrender.com/api/photo/${id}`)
      .then(res => res.json())
      .then(data => setPhotoUrl(data.url));
  }, [id]);

  return (
    <Link
      to={`/restaurant/${id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <img
          src={photoUrl || `https://source.unsplash.com/600x400/?restaurant,${city}`}
          alt={name}
          style={{
            width: "100%",
            height: "240px",
            objectFit: "cover",
            borderRadius: "16px"
          }}
        />

        <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{name}</div>
        <div style={{ opacity: 0.7 }}>{city} · {cuisine}</div>
      </div>
    </Link>
  );
}