import { describe, expect, it } from "vitest";
import {
  getTierInfo,
  getPlanOfflineHours,
  getPlanOfflineIntervalString,
  TIER_DEFINITIONS,
} from "../shared/src/domain/subscriptionTiers";
import { Company } from "../shared/src/domain/demoData";

describe("Subscription Tiers & Offline Access Limits", () => {
  describe("1. Tier Identification and Entitlement Breakdown", () => {
    it("correctly resolves Basic tier: 1 device slot, 48 hours offline, 3 templates", () => {
      const tier = getTierInfo("Basic Annual", 1);
      expect(tier.id).toBe("basic");
      expect(tier.name).toBe("Basic");
      expect(tier.defaultSlots).toBe(1);
      expect(tier.offlineHours).toBe(48);
      expect(tier.offlineDays).toBe(2);
      expect(tier.offlineAccessLabel).toBe("48 Hours Offline Access");
      expect(tier.offlineLeaseWindowLabel).toBe("48 Hours");
      expect(tier.templatesCount).toBe(3);
      expect(tier.templatesLabel).toBe("3 Templates");
      expect(tier.breakdownSummary).toBe("1 Slot, 48 Hours Offline Access, 3 Templates");
    });

    it("correctly resolves Plus tier: 3 device slots, 7 days offline, 5 templates", () => {
      const tier = getTierInfo("Plus Annual", 3);
      expect(tier.id).toBe("plus");
      expect(tier.name).toBe("Plus");
      expect(tier.defaultSlots).toBe(3);
      expect(tier.offlineHours).toBe(168); // 7 * 24
      expect(tier.offlineDays).toBe(7);
      expect(tier.offlineAccessLabel).toBe("7 Days Offline Access");
      expect(tier.offlineLeaseWindowLabel).toBe("7 Days (168 Hours)");
      expect(tier.templatesCount).toBe(5);
      expect(tier.templatesLabel).toBe("5 Templates");
      expect(tier.breakdownSummary).toBe("3 Slots, 7 Days Offline Access, 5 Templates");
    });

    it("correctly resolves Premium tier: 5 device slots, 15 days offline, custom templates", () => {
      const tier = getTierInfo("Premium Annual", 5);
      expect(tier.id).toBe("premium");
      expect(tier.name).toBe("Premium");
      expect(tier.defaultSlots).toBe(5);
      expect(tier.offlineHours).toBe(360); // 15 * 24
      expect(tier.offlineDays).toBe(15);
      expect(tier.offlineAccessLabel).toBe("15 Days Offline Access");
      expect(tier.offlineLeaseWindowLabel).toBe("15 Days (360 Hours)");
      expect(tier.templatesLabel).toBe("Custom Templates");
      expect(tier.breakdownSummary).toBe("5 Slots, 15 Days Offline Access, Custom Templates");
    });

    it("dynamically adapts slot breakdown when admin assigns extra terminal slots", () => {
      // Basic with 2 slots
      const basicCustomSlots = getTierInfo("Basic Monthly", 2);
      expect(basicCustomSlots.breakdownSummary).toBe("2 Slots, 48 Hours Offline Access, 3 Templates");

      // Plus with 4 slots
      const plusCustomSlots = getTierInfo("Plus Annual", 4);
      expect(plusCustomSlots.breakdownSummary).toBe("4 Slots, 7 Days Offline Access, 5 Templates");

      // Premium with 10 slots
      const premiumCustomSlots = getTierInfo("Premium Enterprise", 10);
      expect(premiumCustomSlots.breakdownSummary).toBe("10 Slots, 15 Days Offline Access, Custom Templates");
    });

    it("correctly identifies Guest Trial with 72-hour window and 1 default template", () => {
      const guestTier = getTierInfo("Guest Mode Trial", 1);
      expect(guestTier.id).toBe("guest");
      expect(guestTier.offlineHours).toBe(72);
      expect(guestTier.offlineAccessLabel).toBe("72 Hours Offline Access");
      expect(guestTier.breakdownSummary).toBe("1 Slot, 72 Hours Offline Access, 1 Default Template");
    });
  });

  describe("2. Offline Access Limits & Security Monitor Tracking", () => {
    it("computes accurate percentage for Basic tier 48-hour limit", () => {
      const basicTier = getTierInfo("Basic Annual", 1);
      const maxMs = basicTier.offlineHours * 3600 * 1000; // 48h in ms

      // 24 hours remaining should be 50%
      const remaining24h = 24 * 3600 * 1000;
      const percent24 = Math.round((remaining24h / maxMs) * 100);
      expect(percent24).toBe(50);

      // 12 hours remaining should be 25%
      const remaining12h = 12 * 3600 * 1000;
      const percent12 = Math.round((remaining12h / maxMs) * 100);
      expect(percent12).toBe(25);
    });

    it("computes accurate percentage for Plus tier 7-day (168h) limit", () => {
      const plusTier = getTierInfo("Plus Annual", 3);
      const maxMs = plusTier.offlineHours * 3600 * 1000; // 168h in ms

      // 84 hours remaining should be exactly 50%
      const remaining84h = 84 * 3600 * 1000;
      const percent = Math.round((remaining84h / maxMs) * 100);
      expect(percent).toBe(50);
    });

    it("computes accurate percentage for Premium tier 15-day (360h) limit", () => {
      const premiumTier = getTierInfo("Premium Annual", 5);
      const maxMs = premiumTier.offlineHours * 3600 * 1000; // 360h in ms

      // 180 hours remaining should be exactly 50%
      const remaining180h = 180 * 3600 * 1000;
      const percent = Math.round((remaining180h / maxMs) * 100);
      expect(percent).toBe(50);
    });
  });

  describe("3. SQL Interval Strings for Backend Cryptographic Leases", () => {
    it("returns correct Postgres interval string for each subscription plan", () => {
      expect(getPlanOfflineIntervalString("Basic Annual")).toBe("48 hours");
      expect(getPlanOfflineIntervalString("Basic Monthly")).toBe("48 hours");
      expect(getPlanOfflineIntervalString("Plus Annual")).toBe("7 days");
      expect(getPlanOfflineIntervalString("Plus Monthly")).toBe("7 days");
      expect(getPlanOfflineIntervalString("Premium Annual")).toBe("15 days");
      expect(getPlanOfflineIntervalString("Guest Trial")).toBe("72 hours");
    });

    it("returns correct total offline hours for each subscription plan", () => {
      expect(getPlanOfflineHours("Basic Annual")).toBe(48);
      expect(getPlanOfflineHours("Plus Annual")).toBe(168);
      expect(getPlanOfflineHours("Premium Annual")).toBe(360);
      expect(getPlanOfflineHours("Guest")).toBe(72);
    });
  });

  describe("4. Company Integration & UI Indicators Consistency", () => {
    it("formats complete breakdown for company entity seamlessly", () => {
      const mockBasicCompany: Company = {
        id: "comp_1",
        name: "Test Bakery",
        code: "BAKERY",
        email: "test@bakery.com",
        status: "active",
        plan: "Basic Annual",
        license: "LIC-BASIC",
        expires: "2027-10-31",
        seatsUsed: 1,
        seatsAllowed: 1,
        devicesAllowed: 1,
        templates: ["Default Invoice", "Editorial Serif", "Executive Charcoal & Gold"],
        devices: [],
      };

      const tier = getTierInfo(mockBasicCompany.plan, mockBasicCompany.devicesAllowed);
      expect(tier.breakdownSummary).toBe("1 Slot, 48 Hours Offline Access, 3 Templates");
      expect(tier.offlineLeaseWindowLabel).toBe("48 Hours");
      expect(tier.offlineAccessLabel).toBe("48 Hours Offline Access");
    });

    it("formats complete breakdown for Plus company entity seamlessly", () => {
      const mockPlusCompany: Company = {
        id: "comp_2",
        name: "Retail Chain LLC",
        code: "RETAIL",
        email: "admin@retail.com",
        status: "active",
        plan: "Plus Annual",
        license: "LIC-PLUS",
        expires: "2027-10-31",
        seatsUsed: 1,
        seatsAllowed: 3,
        devicesAllowed: 3,
        templates: [
          "Default Invoice",
          "Editorial Serif",
          "Executive Charcoal & Gold",
          "Nordic Minimal Sage",
        ],
        devices: [],
      };

      const tier = getTierInfo(mockPlusCompany.plan, mockPlusCompany.devicesAllowed);
      expect(tier.breakdownSummary).toBe("3 Slots, 7 Days Offline Access, 5 Templates");
      expect(tier.offlineLeaseWindowLabel).toBe("7 Days (168 Hours)");
      expect(tier.offlineAccessLabel).toBe("7 Days Offline Access");
    });
  });

  describe("5. Manual Custom Offline Lease Override & Special Consideration Precedence", () => {
    it("overrides Basic tier default (48h) with custom 15-minute lease", () => {
      const customBasic = getTierInfo("Basic Annual", 1, "15 minutes");
      expect(customBasic.id).toBe("basic");
      expect(customBasic.isCustomOverride).toBe(true);
      expect(customBasic.offlineMinutes).toBe(15);
      expect(customBasic.offlineHours).toBe(0.25);
      expect(customBasic.offlineAccessLabel).toBe("15 Minutes Offline Access (Custom Override)");
      expect(customBasic.offlineLeaseWindowLabel).toBe("15 Minutes (Custom Override)");
      expect(customBasic.breakdownSummary).toBe(
        "1 Slot, 15 Minutes Offline Access (Custom Override), 3 Templates",
      );
    });

    it("overrides Plus tier default (7 days) with custom 2-hour lease", () => {
      const customPlus = getTierInfo("Plus Annual", 3, "2 hours");
      expect(customPlus.id).toBe("plus");
      expect(customPlus.isCustomOverride).toBe(true);
      expect(customPlus.offlineMinutes).toBe(120);
      expect(customPlus.offlineHours).toBe(2);
      expect(customPlus.offlineAccessLabel).toBe("2 Hours Offline Access (Custom Override)");
      expect(customPlus.breakdownSummary).toBe(
        "3 Slots, 2 Hours Offline Access (Custom Override), 5 Templates",
      );
    });

    it("overrides Premium tier default (15 days) with custom 30-day lease", () => {
      const customPremium = getTierInfo("Premium Annual", 5, "30 days");
      expect(customPremium.id).toBe("premium");
      expect(customPremium.isCustomOverride).toBe(true);
      expect(customPremium.offlineMinutes).toBe(43200);
      expect(customPremium.offlineHours).toBe(720);
      expect(customPremium.offlineDays).toBe(30);
      expect(customPremium.offlineAccessLabel).toBe("30 Days Offline Access (Custom Override)");
      expect(customPremium.breakdownSummary).toBe(
        "5 Slots, 30 Days Offline Access (Custom Override), Custom Templates",
      );
    });

    it("automatically applies preset default duration when custom override is omitted or empty", () => {
      const standardBasic = getTierInfo("Basic Annual", 1, undefined);
      expect(standardBasic.isCustomOverride).toBe(false);
      expect(standardBasic.offlineHours).toBe(48);
      expect(standardBasic.breakdownSummary).toBe("1 Slot, 48 Hours Offline Access, 3 Templates");

      const emptyOverride = getTierInfo("Basic Annual", 1, "   ");
      expect(emptyOverride.isCustomOverride).toBe(false);
      expect(emptyOverride.offlineHours).toBe(48);
    });

    it("generates exact Postgres interval strings for custom duration overrides", () => {
      expect(getPlanOfflineIntervalString("Basic Annual", 1, "15 minutes")).toBe("15 minutes");
      expect(getPlanOfflineIntervalString("Basic Annual", 1, "2 hours")).toBe("2 hours");
      expect(getPlanOfflineIntervalString("Plus Annual", 3, "10 days")).toBe("10 days");
      expect(getPlanOfflineIntervalString("Basic Annual", 1, "")).toBe("48 hours");
      expect(getPlanOfflineIntervalString("Plus Annual", 3)).toBe("7 days");
    });

    it("computes accurate monitor progress percentage for sub-hour 15-minute lease", () => {
      const customTier = getTierInfo("Basic Annual", 1, "15 minutes");
      const maxMs = (customTier.offlineMinutes || 15) * 60 * 1000; // 900,000 ms

      // 7.5 minutes remaining should be 50%
      const remainingHalf = 7.5 * 60 * 1000;
      const percentHalf = Math.round((remainingHalf / maxMs) * 100);
      expect(percentHalf).toBe(50);

      // 3 minutes remaining should be 20%
      const remaining3m = 3 * 60 * 1000;
      const percent3m = Math.round((remaining3m / maxMs) * 100);
      expect(percent3m).toBe(20);
    });
  });
});

