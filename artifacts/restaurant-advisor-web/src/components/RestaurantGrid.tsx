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
  const [openNow, setOpenNow] = useState(false);
  const [openStatus, setOpenStatus] = useState<
    Record<string, boolean | null>
  >({});
  const [checkingOpenStatus, setCheckingOpenStatus] = useState(false);

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

  useEffect(() => {
    if (!openNow || restaurants.length === 0) {
      setCheckingOpenStatus(false);
      return;
    }

    const unchecked = restaurants.filter(
      (restaurant: any) => !(restaurant.id in openStatus)
    );
    if (unchecked.length === 0) {
      setCheckingOpenStatus(false);
      return;
    }

    let cancelled = false;
    let nextIndex = 0;
    setCheckingOpenStatus(true);

    async function worker() {
      while (!cancelled && nextIndex < unchecked.length) {
        const restaurant: any = unchecked[nextIndex++];
        try {
          const response = await fetch(
            `https://the-food-advisor-api.onrender.com/api/open/${encodeURIComponent(restaurant.id)}`
          );
          if (!response.ok) {
            throw new Error("Opening status is unavailable.");
          }
          const data = await response.json();
          if (!cancelled) {
            setOpenStatus(prev => ({
              ...prev,
              [restaurant.id]:
                typeof data.openNow === "boolean" ? data.openNow : null
            }));
          }
        } catch {
          if (!cancelled) {
            setOpenStatus(prev => ({
              ...prev,
              [restaurant.id]: null
            }));
          }
        }
      }
    }

    void Promise.all(
      Array.from({ length: Math.min(4, unchecked.length) }, () => worker())
    ).finally(() => {
      if (!cancelled) {
        setCheckingOpenStatus(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [openNow, restaurants]);

  if (loading) {
    return <div className="section">Loading restaurants…</div>;
  }

  const filtered = restaurants.filter((r: any) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase());

    const matchesCity =
      city === "" || r.city === city;

    const matchesCuisine =
      cuisine === "" || r.types?.includes(cuisine);

    const matchesRating =
      rating === "" || r.rating >= parseFloat(rating);

    const matchesOpenNow =
      !openNow || openStatus[r.id] === true;

    return (
      matchesSearch &&
      matchesCity &&
      matchesCuisine &&
      matchesRating &&
      matchesOpenNow
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
        openNow={openNow}
        setOpenNow={setOpenNow}
      />

      <div className="grid">
        {filtered.map((r: any) => (
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

      {checkingOpenStatus && (
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          Checking which restaurants are open…
        </p>
      )}

      {!checkingOpenStatus && filtered.length === 0 && (
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          No restaurants match these filters.
        </p>
      )}
    </div>
  );
}