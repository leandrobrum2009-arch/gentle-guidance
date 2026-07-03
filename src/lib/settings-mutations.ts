import { z } from "zod";

/**
 * A row in `public.site_settings`. Both columns are `text`; values are
 * always serialized to strings before being written back.
 */
export const settingRowSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "key não pode ser vazio")
    .max(100, "key excede 100 caracteres")
    .regex(/^[a-z0-9_]+$/i, "key deve conter apenas letras, números e underscore"),
  value: z.string().max(10_000, "value excede 10.000 caracteres"),
});

export type SettingRow = z.infer<typeof settingRowSchema>;
export type SettingMutation =
  | { op: "upsert"; key: string; value: string }
  | { op: "update"; key: string; value: string };

/** Coerce any value to the string form used by the settings table. */
export function normalizeSettingValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

/**
 * Build the list of DB mutations needed to persist admin settings changes.
 * - New keys (not present in `initial`) become an upsert on `key`.
 * - Changed keys become an update.
 * - Unchanged keys are skipped.
 * - Invalid rows (empty/malformed key, oversize value) are skipped.
 * - Duplicate keys in `current` collapse to the last occurrence (last write wins).
 *
 * IMPORTANT: payloads MUST NOT contain a `type` field — the `site_settings`
 * table has no such column, and sending it silently fails the write.
 */
export function buildSettingsMutations(
  current: Array<{ key: string; value: unknown }>,
  initial: Array<{ key: string; value: unknown }>,
): SettingMutation[] {
  // Collapse duplicates in current — last write wins.
  const deduped = new Map<string, string>();
  for (const s of current) {
    const parsed = settingRowSchema.safeParse({
      key: s?.key,
      value: normalizeSettingValue(s?.value),
    });
    if (parsed.success) deduped.set(parsed.data.key, parsed.data.value);
  }

  const initialMap = new Map<string, string>();
  for (const s of initial) {
    if (s && typeof s.key === "string") {
      initialMap.set(s.key, normalizeSettingValue(s.value));
    }
  }

  const mutations: SettingMutation[] = [];
  for (const [key, value] of deduped) {
    if (!initialMap.has(key)) {
      mutations.push({ op: "upsert", key, value });
    } else if (initialMap.get(key) !== value) {
      mutations.push({ op: "update", key, value });
    }
  }
  return mutations;
}