export type SettingRow = { key: string; value: string };
export type SettingMutation =
  | { op: "upsert"; key: string; value: string }
  | { op: "update"; key: string; value: string };

/**
 * Build the list of DB mutations needed to persist admin settings changes.
 * - New keys (not present in `initial`) become an upsert on `key`.
 * - Changed keys become an update.
 * - Unchanged keys are skipped.
 *
 * IMPORTANT: payloads MUST NOT contain a `type` field — the `site_settings`
 * table has no such column, and sending it silently fails the write.
 */
export function buildSettingsMutations(
  current: SettingRow[],
  initial: SettingRow[],
): SettingMutation[] {
  const mutations: SettingMutation[] = [];
  for (const s of current) {
    const prev = initial.find((i) => i.key === s.key);
    if (!prev) {
      mutations.push({ op: "upsert", key: s.key, value: s.value });
    } else if (prev.value !== s.value) {
      mutations.push({ op: "update", key: s.key, value: s.value });
    }
  }
  return mutations;
}