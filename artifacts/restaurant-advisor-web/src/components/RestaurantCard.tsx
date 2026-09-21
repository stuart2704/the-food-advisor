type Props = {
  name: string;
  city: string;
  cuisine: string;
  image: string;
};

export default function RestaurantCard({ name, city, cuisine, image }: Props) {
  return (
    <div className="card">
      <img
        src={image}
        alt={name}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
          borderRadius: "12px",
          border: "none",
          boxShadow: "none"
        }}
      />
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{name}</div>
      <div style={{ opacity: 0.7 }}>{city} · {cuisine}</div>
    </div>
  );
}