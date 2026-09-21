type Props = {
  name: string;
  city: string;
  cuisine: string;
};

export function RestaurantCard({ name, city, cuisine }: Props) {
  return (
    <div
      style={{
        background: "#111827",
        borderRadius: "8px",
        padding: "16px",
        border: "1px solid #1f2937",
        marginBottom: "12px"
      }}
    >
      <div style={{ fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
        {city} · {cuisine}
      </div>
    </div>
  );
}