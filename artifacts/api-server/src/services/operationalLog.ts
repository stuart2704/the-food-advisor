import {
  db,
  operationalLogEventsTable,
  type OperationalLogEvent,
} from "@workspace/db";
import {
  and,
  arrayContains,
  desc,
  eq,
  inArray,
  lt,
} from "drizzle-orm";

export interface SanitizedOperationalEvent {
  id: string;
  time: string;
  type: string;
  message: string;
  category?: string;
  bookmarked: boolean;
  tags: string[];
}

const MAX_MESSAGE_LENGTH = 1_000;
const MAX_CATEGORY_LENGTH = 64;
const MAX_TYPE_LENGTH = 32;

function redactSensitiveText(value: string): string {
  return value
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(
      /\b(api[_-]?key|password|secret|token)\b\s*[:=]\s*[^\s,;]+/gi,
      "$1=[redacted]",
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeOperationalEvent(
  type: string,
  message: string,
  category?: string,
): Omit<SanitizedOperationalEvent, "id" | "time" | "bookmarked" | "tags"> {
  const normalizedType =
    type
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .slice(0, MAX_TYPE_LENGTH) || "info";
  const normalizedMessage =
    redactSensitiveText(message).slice(0, MAX_MESSAGE_LENGTH) ||
    "Operational event";
  const normalizedCategory = category
    ? category
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_")
        .slice(0, MAX_CATEGORY_LENGTH)
    : "";
  return {
    type: normalizedType,
    message: normalizedMessage,
    ...(normalizedCategory ? { category: normalizedCategory } : {}),
  };
}

export async function persistOperationalEvent(
  event: SanitizedOperationalEvent,
): Promise<void> {
  await db
    .insert(operationalLogEventsTable)
    .values({
      id: event.id,
      createdAt: new Date(event.time),
      type: event.type,
      message: event.message,
      category: event.category,
      bookmarked: event.bookmarked,
      tags: event.tags,
    })
    .onConflictDoNothing();
}

function serializeEvent(event: OperationalLogEvent): SanitizedOperationalEvent {
  return {
    id: event.id,
    time: event.createdAt.toISOString(),
    type: event.type,
    message: event.message,
    ...(event.category ? { category: event.category } : {}),
    bookmarked: event.bookmarked,
    tags: [...event.tags],
  };
}

export async function listOperationalEvents(options: {
  page: number;
  limit: number;
  type?: string;
  tag?: string;
  bookmarked?: boolean;
}) {
  const filters = [
    ...(options.type
      ? [eq(operationalLogEventsTable.type, options.type)]
      : []),
    ...(options.tag
      ? [arrayContains(operationalLogEventsTable.tags, [options.tag])]
      : []),
    ...(options.bookmarked === undefined
      ? []
      : [eq(operationalLogEventsTable.bookmarked, options.bookmarked)]),
  ];
  const rows = await db
    .select()
    .from(operationalLogEventsTable)
    .where(and(...filters))
    .orderBy(
      desc(operationalLogEventsTable.createdAt),
      desc(operationalLogEventsTable.id),
    )
    .limit(options.limit + 1)
    .offset((options.page - 1) * options.limit);
  return {
    items: rows.slice(0, options.limit).map(serializeEvent),
    hasMore: rows.length > options.limit,
  };
}

export async function setOperationalEventBookmark(
  id: string,
  bookmarked: boolean,
): Promise<boolean> {
  const rows = await db
    .update(operationalLogEventsTable)
    .set({ bookmarked })
    .where(eq(operationalLogEventsTable.id, id))
    .returning({ id: operationalLogEventsTable.id });
  return rows.length === 1;
}

export async function setOperationalEventTags(
  id: string,
  tags: string[],
): Promise<boolean> {
  const rows = await db
    .update(operationalLogEventsTable)
    .set({ tags })
    .where(eq(operationalLogEventsTable.id, id))
    .returning({ id: operationalLogEventsTable.id });
  return rows.length === 1;
}

export async function getOperationalEventsByIds(
  ids: string[],
): Promise<SanitizedOperationalEvent[]> {
  const rows = await db
    .select()
    .from(operationalLogEventsTable)
    .where(inArray(operationalLogEventsTable.id, ids))
    .orderBy(
      desc(operationalLogEventsTable.createdAt),
      desc(operationalLogEventsTable.id),
    );
  return rows.map(serializeEvent);
}

export async function cleanupOperationalEvents(): Promise<number> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1_000);
  const rows = await db
    .delete(operationalLogEventsTable)
    .where(lt(operationalLogEventsTable.createdAt, cutoff))
    .returning({ id: operationalLogEventsTable.id });
  return rows.length;
}