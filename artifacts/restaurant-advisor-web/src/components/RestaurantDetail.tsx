import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

function formatPrice(level: string | null) {
  if (level === null) return "Not available";
  return (
    {
      PRICE_LEVEL_FREE: "Free",
      PRICE_LEVEL_INEXPENSIVE: "£",
      PRICE_LEVEL_MODERATE: "££",
      PRICE_LEVEL_EXPENSIVE: "£££",
      PRICE_LEVEL_VERY_EXPENSIVE: "££££"
    }[level] || "Not available"
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [aiDescription, setAiDescription] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [hours, setHours] = useState<string[]>([]);
  const [openNow, setOpenNow] = useState<boolean | null>(null);
  const [priceLevel, setPriceLevel] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const claimToken =
    searchParams.get("claimToken") || searchParams.get("token") || "";

  async function handleClaim() {
    if (!restaurant || !email.trim()) {
      window.alert("Enter your business email.");
      return;
    }
    if (!claimToken) {
      window.alert(
        "A secure claim link is required. Please use the link sent to the restaurant's business email."
      );
      return;
    }

    setClaimSubmitting(true);
    try {
      const response = await fetch(
        `/api/restaurants/${encodeURIComponent(restaurant.id)}/claim`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            claimToken
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The claim could not be submitted.");
      }
      setRestaurant((current: any) => ({ ...current, claimed: true }));
      window.alert("Your restaurant claim has been verified.");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "The claim could not be submitted."
      );
    } finally {
      setClaimSubmitting(false);
    }
  }

  useEffect(() => {
    fetch("/api/restaurants")
      .then(res => res.json())
      .then(data => {
        const match = data.find((r: any) => r.id === id);
        setRestaurant(match);
        if (match) {
          fetch("/ai/describe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: match.name,
              city: match.city,
              cuisine: match.types?.[0] || "Restaurant",
              rating: match.rating
            })
          })
            .then(res => res.json())
            .then(data => setAiDescription(data.description));
        }
      });

    if (id) {
      fetch(
        `/api/photos/${encodeURIComponent(id)}`
      )
        .then(res => {
          if (!res.ok) {
            throw new Error("Restaurant photos are unavailable.");
          }
          return res.json();
        })
        .then(data => {
          setGallery(Array.isArray(data.photos) ? data.photos : []);
        })
        .catch(() => setGallery([]));

      fetch(
        `/api/reviews/google/${encodeURIComponent(id)}`
      )
        .then(res => {
          if (!res.ok) {
            throw new Error("Google reviews are unavailable.");
          }
          return res.json();
        })
        .then(data => {
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
          return fetch(
            `/api/hours/${encodeURIComponent(id)}`
          );
        })
        .then(res => {
          if (!res.ok) {
            throw new Error("Opening hours are unavailable.");
          }
          return res.json();
        })
        .then(data => {
          setHours(Array.isArray(data.hours) ? data.hours : []);
          setOpenNow(typeof data.openNow === "boolean" ? data.openNow : null);
          return fetch(
            `/api/price/${encodeURIComponent(id)}`
          );
        })
        .then(res => {
          if (!res.ok) {
            throw new Error("Price level is unavailable.");
          }
          return res.json();
        })
        .then(data => {
          setPriceLevel(
            typeof data.priceLevel === "string" ? data.priceLevel : null
          );
        })
        .catch(() => {
          setReviews([]);
          setHours([]);
          setOpenNow(null);
          setPriceLevel(null);
        });
    }
  }, [id]);

  useEffect(() => {
    if (!restaurant) return;

    try {
      const stored = JSON.parse(
        window.localStorage.getItem("recentlyViewed") || "[]"
      ) as unknown;
      const viewed = Array.isArray(stored)
        ? stored.filter((item): item is {
            id: string;
            name: string;
            city: string;
            image: string;
          } => {
            if (!item || typeof item !== "object") return false;
            const value = item as Record<string, unknown>;
            return (
              typeof value.id === "string" &&
              typeof value.name === "string" &&
              typeof value.city === "string" &&
              typeof value.image === "string"
            );
          })
        : [];
      const updated = [
        {
          id: String(restaurant.id),
          name: String(restaurant.name),
          city: String(restaurant.city),
          image: gallery[0] || ""
        },
        ...viewed.filter((item) => item.id !== restaurant.id)
      ];

      window.localStorage.setItem(
        "recentlyViewed",
        JSON.stringify(updated.slice(0, 10))
      );
    } catch {
      window.localStorage.removeItem("recentlyViewed");
    }
  }, [restaurant, gallery]);

  if (!restaurant) {
    return <div className="section">Loading…</div>;
  }

  return (
    <div className="section" style={{ maxWidth: "900px" }}>
      <img
        src={
          gallery[0] ||
          `https://source.unsplash.com/900x500/?restaurant,${restaurant.city}`
        }
        alt={restaurant.name}
        style={{
          width: "100%",
          height: "400px",
          objectFit: "cover",
          borderRadius: "16px",
          marginBottom: "24px"
        }}
      />

      {gallery.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <Swiper spaceBetween={20} slidesPerView={1.2}>
            {gallery.map((url, i) => (
              <SwiperSlide key={i}>
                <img
                  src={url}
                  alt={`Photo ${i}`}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "16px"
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

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
        <strong>Price Level:</strong> {formatPrice(priceLevel)}
      </div>

      {hours.length > 0 && (
        <div
          style={{
            marginTop: "40px",
            background: "#fff",
            padding: "24px",
            borderRadius: "16px"
          }}
        >
          <h2 style={{ marginBottom: "12px" }}>Opening Hours</h2>

          {openNow !== null && (
            <div
              style={{
                marginBottom: "16px",
                fontWeight: 600,
                color: openNow ? "green" : "red"
              }}
            >
              {openNow ? "Open Now" : "Closed"}
            </div>
          )}

          {hours.map((line: string, i) => (
            <div key={i} style={{ marginBottom: "8px", opacity: 0.8 }}>
              {line}
            </div>
          ))}
        </div>
      )}

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

      {restaurant.bookingUrl && (
        <div style={{ marginTop: "20px" }}>
          <a
            href={restaurant.bookingUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "14px 24px",
              background: "#d94800",
              color: "#fff",
              borderRadius: "12px",
              fontWeight: 600,
              textDecoration: "none"
            }}
          >
            Book a Table
          </a>
        </div>
      )}

      {restaurant.offers && restaurant.offers.length > 0 && (
        <div
          style={{
            marginTop: "40px",
            background: "#fff",
            padding: "24px",
            borderRadius: "16px"
          }}
        >
          <h2>Special Offers</h2>

          {restaurant.offers.map((offer: {
            title: string;
            description: string;
            startDate: string;
            endDate: string;
          }, i: number) => (
            <div
              key={i}
              style={{
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "1px solid #eee"
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "6px" }}>
                {offer.title}
              </div>

              <div style={{ opacity: 0.8, marginBottom: "8px" }}>
                {offer.description}
              </div>

              <div style={{ fontSize: "0.9rem", opacity: 0.6 }}>
                {offer.startDate} → {offer.endDate}
              </div>
            </div>
          ))}
        </div>
      )}

      {restaurant.events && restaurant.events.length > 0 && (
        <div
          style={{
            marginTop: "40px",
            background: "#fff",
            padding: "24px",
            borderRadius: "16px"
          }}
        >
          <h2>Events & Live Music</h2>

          {restaurant.events.map((event: {
            title: string;
            description: string;
            date: string;
            time: string;
            price: string;
          }, i: number) => (
            <div
              key={i}
              style={{
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "1px solid #eee"
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "6px" }}>
                {event.title}
              </div>

              <div style={{ opacity: 0.8, marginBottom: "8px" }}>
                {event.description}
              </div>

              <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                {event.date} at {event.time}
              </div>

              <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                {event.price}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "40px", opacity: 0.7 }}>
        <em>More features coming soon…</em>
      </div>

      {aiDescription && (
        <div
          style={{
            marginTop: "40px",
            fontSize: "1.1rem",
            lineHeight: "1.6",
            background: "#fff",
            padding: "24px",
            borderRadius: "16px"
          }}
        >
          <h2 style={{ marginBottom: "12px" }}>AI‑Generated Description</h2>
          {aiDescription}
        </div>
      )}

      {reviews.length > 0 && (
        <div
          style={{
            marginTop: "40px",
            background: "#fff",
            padding: "24px",
            borderRadius: "16px"
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Google Reviews</h2>

          {reviews.map((rev: any, i) => (
            <div
              key={i}
              style={{
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "1px solid #eee"
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "6px" }}>
                {rev.authorAttribution?.displayName || "Anonymous"}
              </div>

              <div style={{ opacity: 0.7, marginBottom: "8px" }}>
                ⭐ {rev.rating} — {new Date(rev.publishTime).toLocaleDateString()}
              </div>

              <div style={{ lineHeight: "1.6" }}>
                {rev.text?.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {restaurant.claimed === false && (
        <div
          style={{
            marginTop: "40px",
            padding: "24px",
            background: "#fff",
            borderRadius: "16px"
          }}
        >
          <h2>Claim this restaurant</h2>
          <p>If you are the owner, you can claim this listing.</p>

          <input
            type="email"
            placeholder="Your business email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "12px",
              width: "100%",
              marginBottom: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={handleClaim}
            disabled={claimSubmitting}
            style={{
              padding: "12px 20px",
              background: "#d94800",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              cursor: claimSubmitting ? "wait" : "pointer",
              opacity: claimSubmitting ? 0.7 : 1
            }}
          >
            {claimSubmitting ? "Submitting…" : "Submit Claim"}
          </button>
        </div>
      )}
    </div>
  );
}