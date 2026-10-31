export interface SubscriptionTierInfo {
  id: "basic" | "plus" | "premium" | "guest";
  name: string;
  tagline: string;
  defaultSlots: number;
  offlineHours: number;
  offlineMinutes?: number;
  offlineDays?: number;
  offlineAccessLabel: string;
  offlineLeaseWindowLabel: string;
  templatesCount: number;
  templatesLabel: string;
  breakdownSummary: string;
  isCustomOverride?: boolean;
}

export const TIER_DEFINITIONS: Record<"basic" | "plus" | "premium", SubscriptionTierInfo> = {
  basic: {
    id: "basic",
    name: "Basic",
    tagline: "Single counter & boutique POS",
    defaultSlots: 1,
    offlineHours: 48,
    offlineMinutes: 2880,
    offlineDays: 2,
    offlineAccessLabel: "48 Hours Offline Access",
    offlineLeaseWindowLabel: "48 Hours",
    templatesCount: 3,
    templatesLabel: "3 Templates",
    breakdownSummary: "1 Slot, 48 Hours Offline Access, 3 Templates",
  },
  plus: {
    id: "plus",
    name: "Plus",
    tagline: "Growth retail & multi-counter",
    defaultSlots: 3,
    offlineHours: 168, // 7 days * 24 hours
    offlineMinutes: 10080,
    offlineDays: 7,
    offlineAccessLabel: "7 Days Offline Access",
    offlineLeaseWindowLabel: "7 Days (168 Hours)",
    templatesCount: 5,
    templatesLabel: "5 Templates",
    breakdownSummary: "3 Slots, 7 Days Offline Access, 5 Templates",
  },
  premium: {
    id: "premium",
    name: "Premium",
    tagline: "Multi-branch retail & enterprise branding",
    defaultSlots: 5,
    offlineHours: 360, // 15 days * 24 hours
    offlineMinutes: 21600,
    offlineDays: 15,
    offlineAccessLabel: "15 Days Offline Access",
    offlineLeaseWindowLabel: "15 Days (360 Hours)",
    templatesCount: 5,
    templatesLabel: "Custom Templates",
    breakdownSummary: "5 Slots, 15 Days Offline Access, Custom Templates",
  },
};

/**
 * Parses user-configured durations such as "15 minutes", "2 hours", "7 days", "15m" into total minutes.
 */
export function parseDurationToMinutes(durationStr?: string): number | null {
  if (!durationStr || typeof durationStr !== "string" || !durationStr.trim()) {
    return null;
  }
  const clean = durationStr.trim();
  const match = clean.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)$/i);
  if (!match) return null;

  const val = parseFloat(match[1]);
  if (isNaN(val) || val <= 0) return null;

  const unit = match[2].toLowerCase();
  if (unit.startsWith("m") && !unit.startsWith("mo")) {
    return Math.max(1, Math.round(val));
  }
  if (unit.startsWith("h")) {
    return Math.max(1, Math.round(val * 60));
  }
  if (unit.startsWith("d")) {
    return Math.max(1, Math.round(val * 1440));
  }
  return null;
}

/**
 * Formats duration in minutes into a clean readable label e.g. "15 Minutes", "48 Hours", "7 Days".
 */
export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} Minute${minutes === 1 ? "" : "s"}`;
  }
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} Day${days === 1 ? "" : "s"}`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} Hour${hours === 1 ? "" : "s"}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function getTierInfo(
  plan?: string,
  devicesAllowed?: number,
  offlineLeaseOverride?: string,
): SubscriptionTierInfo {
  const p = String(plan || "").toLowerCase().trim();

  // 1. Guest Trial Mode
  if (p.includes("guest")) {
    return {
      id: "guest",
      name: "Guest Trial",
      tagline: "72-Hour Evaluation Mode",
      defaultSlots: 1,
      offlineHours: 72,
      offlineMinutes: 4320,
      offlineDays: 3,
      offlineAccessLabel: "72 Hours Offline Access",
      offlineLeaseWindowLabel: "72 Hours",
      templatesCount: 1,
      templatesLabel: "1 Default Template",
      breakdownSummary: "1 Slot, 72 Hours Offline Access, 1 Default Template",
    };
  }

  // Determine base plan tier
  let base: SubscriptionTierInfo;
  let defaultSlots = 1;

  if (
    p.includes("premium") ||
    (!p.includes("basic") && !p.includes("plus") && Number(devicesAllowed) >= 5)
  ) {
    base = TIER_DEFINITIONS.premium;
    defaultSlots = 5;
  } else if (
    p.includes("plus") ||
    (!p.includes("basic") && Number(devicesAllowed) >= 3)
  ) {
    base = TIER_DEFINITIONS.plus;
    defaultSlots = 3;
  } else {
    base = TIER_DEFINITIONS.basic;
    defaultSlots = 1;
  }

  const slots = devicesAllowed && devicesAllowed > 0 ? devicesAllowed : defaultSlots;

  // Check if a manual custom offline lease override is set
  const customMinutes = parseDurationToMinutes(offlineLeaseOverride);

  if (customMinutes !== null && customMinutes > 0) {
    const formattedDuration = formatDurationLabel(customMinutes);
    const customHours = customMinutes / 60;
    const customDays = customMinutes >= 1440 ? Math.round(customMinutes / 1440) : undefined;

    return {
      ...base,
      defaultSlots: slots,
      offlineHours: customHours,
      offlineMinutes: customMinutes,
      offlineDays: customDays,
      offlineAccessLabel: `${formattedDuration} Offline Access (Custom Override)`,
      offlineLeaseWindowLabel: `${formattedDuration} (Custom Override)`,
      breakdownSummary: `${slots} ${slots === 1 ? "Slot" : "Slots"}, ${formattedDuration} Offline Access (Custom Override), ${base.templatesLabel}`,
      isCustomOverride: true,
    };
  }

  // No manual override: apply standard package default
  return {
    ...base,
    defaultSlots: slots,
    breakdownSummary: `${slots} ${slots === 1 ? "Slot" : "Slots"}, ${base.offlineAccessLabel}, ${base.templatesLabel}`,
    isCustomOverride: false,
  };
}

export function getPlanOfflineHours(
  plan?: string,
  devicesAllowed?: number,
  offlineLeaseOverride?: string,
): number {
  return getTierInfo(plan, devicesAllowed, offlineLeaseOverride).offlineHours;
}

export function getPlanOfflineMinutes(
  plan?: string,
  devicesAllowed?: number,
  offlineLeaseOverride?: string,
): number {
  const tier = getTierInfo(plan, devicesAllowed, offlineLeaseOverride);
  return tier.offlineMinutes || Math.round(tier.offlineHours * 60);
}

export function getPlanOfflineIntervalString(
  plan?: string,
  devicesAllowed?: number,
  offlineLeaseOverride?: string,
): string {
  // If a custom override is configured, use its exact interval in minutes or hours
  const customMinutes = parseDurationToMinutes(offlineLeaseOverride);
  if (customMinutes !== null && customMinutes > 0) {
    if (customMinutes % 1440 === 0) {
      return `${customMinutes / 1440} days`;
    }
    if (customMinutes % 60 === 0) {
      return `${customMinutes / 60} hours`;
    }
    return `${customMinutes} minutes`;
  }

  const tier = getTierInfo(plan, devicesAllowed);
  if (tier.id === "premium") return "15 days";
  if (tier.id === "plus") return "7 days";
  if (tier.id === "basic") return "48 hours";
  return "72 hours";
}
