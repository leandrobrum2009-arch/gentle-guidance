import { describe, it, expect } from "vitest";
import { buildSettingsMutations } from "./settings-mutations";

describe("buildSettingsMutations", () => {
  it("upserts new keys not present in initial (e.g. home_show_game_caixa)", () => {
    const result = buildSettingsMutations(
      [{ key: "home_show_game_caixa", value: "false" }],
      [],
    );
    expect(result).toEqual([
      { op: "upsert", key: "home_show_game_caixa", value: "false" },
    ]);
  });

  it("updates existing keys whose value changed", () => {
    const result = buildSettingsMutations(
      [{ key: "menu_federal_enabled", value: "false" }],
      [{ key: "menu_federal_enabled", value: "true" }],
    );
    expect(result).toEqual([
      { op: "update", key: "menu_federal_enabled", value: "false" },
    ]);
  });

  it("skips keys that did not change", () => {
    const result = buildSettingsMutations(
      [{ key: "site_name", value: "Rifas" }],
      [{ key: "site_name", value: "Rifas" }],
    );
    expect(result).toEqual([]);
  });

  it("never emits a `type` field (site_settings has no such column)", () => {
    const result = buildSettingsMutations(
      [
        { key: "new_key", value: "true" },
        { key: "existing_key", value: "false" },
      ],
      [{ key: "existing_key", value: "true" }],
    );
    for (const m of result) {
      expect(Object.keys(m).sort()).toEqual(["key", "op", "value"]);
    }
  });

  it("handles mixed inserts, updates and no-ops together", () => {
    const result = buildSettingsMutations(
      [
        { key: "a", value: "1" }, // update
        { key: "b", value: "2" }, // no-op
        { key: "c", value: "3" }, // upsert
      ],
      [
        { key: "a", value: "0" },
        { key: "b", value: "2" },
      ],
    );
    expect(result).toEqual([
      { op: "update", key: "a", value: "1" },
      { op: "upsert", key: "c", value: "3" },
    ]);
  });
});