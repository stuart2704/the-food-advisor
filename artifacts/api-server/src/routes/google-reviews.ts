import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const reviewsCache = new Map<
  string,
  { data: PlaceReviewsResponse; expiresAt: number }
>();
const hoursCache = new Map<
  string,
  { data: PlaceHoursResponse; expiresAt: number }
>();

const PlaceParams = z.object({
  placeId: z.string().trim().min(1).max(300),
});

type PlaceReviewsResponse = {
  reviews: unknown[];
  currentOpeningHours: OpeningHours | null;
  regularOpeningHours: OpeningHours | null;
};

type OpeningHours = {
  weekdayDescriptions?: string[];
  openNow?: boolean;
};

type PlaceHoursResponse = {
  hours: string[];
  openNow: boolean | null;
};

router.get("/reviews/google/:placeId", async (req, res): Promise<void> => {
  const parsed = PlaceParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid place ID." });
    return;
  }

  const { placeId } = parsed.data;
  const cached = reviewsCache.get(placeId);
  if (cached && cached.expiresAt > Date.now()) {
    res.setHeader("Cache-Control", "public, max-age=21600");
    res.json(cached.data);
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Google Places reviews are not configured." });
    return;
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "reviews,currentOpeningHours,regularOpeningHours",
        },
      },
    );

    if (!response.ok) {
      const message = await response.text();
      req.log.warn(
        { placeId, status: response.status, message },
        "Google Places reviews request failed",
      );
      res.status(502).json({ error: "Google reviews are temporarily unavailable." });
      return;
    }

    const data = (await response.json()) as Partial<PlaceReviewsResponse>;
    const result: PlaceReviewsResponse = {
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      currentOpeningHours: data.currentOpeningHours ?? null,
      regularOpeningHours: data.regularOpeningHours ?? null,
    };
    hoursCache.set(placeId, {
      data: {
        hours:
          result.currentOpeningHours?.weekdayDescriptions ??
          result.regularOpeningHours?.weekdayDescriptions ??
          [],
        openNow: result.currentOpeningHours?.openNow ?? null,
      },
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    reviewsCache.set(placeId, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    res.setHeader("Cache-Control", "public, max-age=21600");
    res.json(result);
  } catch (error) {
    req.log.error({ err: error, placeId }, "Google Places reviews lookup failed");
    res.status(502).json({ error: "Google reviews are temporarily unavailable." });
  }
});

router.get("/hours/:placeId", async (req, res): Promise<void> => {
  const parsed = PlaceParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid place ID." });
    return;
  }

  const { placeId } = parsed.data;
  const cached = hoursCache.get(placeId);
  if (cached && cached.expiresAt > Date.now()) {
    res.setHeader("Cache-Control", "public, max-age=21600");
    res.json(cached.data);
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Google Places hours are not configured." });
    return;
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "currentOpeningHours,regularOpeningHours",
        },
      },
    );

    if (!response.ok) {
      const message = await response.text();
      req.log.warn(
        { placeId, status: response.status, message },
        "Google Places hours request failed",
      );
      res.status(502).json({ error: "Opening hours are temporarily unavailable." });
      return;
    }

    const data = (await response.json()) as {
      currentOpeningHours?: OpeningHours;
      regularOpeningHours?: OpeningHours;
    };
    const result: PlaceHoursResponse = {
      hours:
        data.currentOpeningHours?.weekdayDescriptions ??
        data.regularOpeningHours?.weekdayDescriptions ??
        [],
      openNow: data.currentOpeningHours?.openNow ?? null,
    };
    hoursCache.set(placeId, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    res.setHeader("Cache-Control", "public, max-age=21600");
    res.json(result);
  } catch (error) {
    req.log.error({ err: error, placeId }, "Google Places hours lookup failed");
    res.status(502).json({ error: "Opening hours are temporarily unavailable." });
  }
});

export default router;