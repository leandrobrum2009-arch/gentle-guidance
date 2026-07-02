import { describe, it, expect } from "vitest";
import { getCampaignDisplaySales } from "./campaign-progress";

const base = {
  sold_tickets: 0,
  total_tickets: 100,
  fake_progress_enabled: false,
  fake_progress_percentage: 0,
  progress_text: "",
  sales_goal: 0,
  ticket_price: 10,
} as any;

describe("getCampaignDisplaySales", () => {
  it("uses real sold tickets when fake progress disabled", () => {
    const r = getCampaignDisplaySales({ ...base, sold_tickets: 25 });
    expect(r.displaySoldTickets).toBe(25);
    expect(r.roundedProgress).toBe(25);
  });

  it("adds fake percentage to real sold when enabled", () => {
    const r = getCampaignDisplaySales({
      ...base,
      sold_tickets: 5,
      fake_progress_enabled: true,
      fake_progress_percentage: 10,
    });
    // 10% of 100 = 10 fake + 5 real = 15
    expect(r.displaySoldTickets).toBe(15);
    expect(r.roundedProgress).toBe(15);
  });

  it("caps display at total tickets", () => {
    const r = getCampaignDisplaySales({
      ...base,
      sold_tickets: 80,
      fake_progress_enabled: true,
      fake_progress_percentage: 90,
    });
    expect(r.displaySoldTickets).toBe(100);
    expect(r.roundedProgress).toBe(100);
  });

  it("updates progress bar after a new purchase", () => {
    const before = getCampaignDisplaySales({ ...base, sold_tickets: 10 });
    const after = getCampaignDisplaySales({ ...base, sold_tickets: 20 });
    expect(after.displaySoldTickets).toBeGreaterThan(before.displaySoldTickets);
    expect(after.roundedProgress).toBeGreaterThan(before.roundedProgress);
  });

  it("keeps fake baseline stable and only real portion moves with sales", () => {
    const p1 = getCampaignDisplaySales({
      ...base,
      sold_tickets: 0,
      fake_progress_enabled: true,
      fake_progress_percentage: 30,
    });
    const p2 = getCampaignDisplaySales({
      ...base,
      sold_tickets: 5,
      fake_progress_enabled: true,
      fake_progress_percentage: 30,
    });
    expect(p1.displaySoldTickets).toBe(30);
    expect(p2.displaySoldTickets).toBe(35);
  });
});
