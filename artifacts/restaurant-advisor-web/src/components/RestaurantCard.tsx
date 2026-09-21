type Props = {
  name: string;
  city: string;
  cuisine: string;
  image: string;
};

export default function RestaurantCard({ name, city, cuisine, image }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        cursor: "pointer"
      }}
    >
      <img
        src={image}
        alt={name}
        style={{
          width: "100%",
          height: "240px",
          objectFit: "cover",
          borderRadius: "16px",
          border: "none",
          boxShadow: "none"
        }}
      />

      <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
        {name}
      </div>

      <div style={{ fontSize: "0.95rem", opacity: 0.7 }}>
        {city} · {cuisine}
      </div>
    </div>
  );
}