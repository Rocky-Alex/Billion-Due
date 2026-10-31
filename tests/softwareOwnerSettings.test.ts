import { describe, it, expect } from "vitest";
import {
  initialOwnerProfile,
  generateRecoveryKey,
  getInitials,
  type SoftwareOwnerProfile,
} from "../shared/src/domain/demoData";

describe("Software Owner Settings - Dynamic Profile & Presets Removal", () => {
  it("initializes with clean, un-presetted profile values", () => {
    expect(initialOwnerProfile.name).toBe("");
    expect(initialOwnerProfile.email).toBe("");
    expect(initialOwnerProfile.contactNo).toBe("");
    expect(initialOwnerProfile.address).toBe("");
    expect(initialOwnerProfile.roleTitle).toBe("");
    expect(initialOwnerProfile.recoveryKey).toBe("");
  });

  it("dynamically generates initials for any custom software owner name", () => {
    expect(getInitials("")).toBe("SO");
    expect(getInitials("   ")).toBe("SO");
    expect(getInitials("Alex")).toBe("AL");
    expect(getInitials("Alex Rivera")).toBe("AR");
    expect(getInitials("Dr. Sarah Jane Watson")).toBe("DW");
  });

  it("generates a valid emergency recovery key format", () => {
    const key = generateRecoveryKey();
    expect(key).toMatch(/^OWNER-REC-[2-9A-Z]{4}-[2-9A-Z]{4}$/);
    const key2 = generateRecoveryKey();
    expect(key).not.toBe(key2);
  });

  it("allows owner to customize and serialize profile without preset data", () => {
    const customOwner: SoftwareOwnerProfile = {
      name: "Marcus Aurelius",
      email: "marcus@enterprise.corp",
      contactNo: "+1 555 019 2834",
      address: "100 Capital Boulevard, Suite 500, Austin, TX",
      roleTitle: "Chief Technology Officer & License Root",
      recoveryKey: generateRecoveryKey(),
    };

    const serialized = JSON.stringify(customOwner);
    const deserialized: SoftwareOwnerProfile = JSON.parse(serialized);

    expect(deserialized.name).toBe("Marcus Aurelius");
    expect(deserialized.email).toBe("marcus@enterprise.corp");
    expect(deserialized.contactNo).toBe("+1 555 019 2834");
    expect(deserialized.address).toBe("100 Capital Boulevard, Suite 500, Austin, TX");
    expect(deserialized.roleTitle).toBe("Chief Technology Officer & License Root");
    expect(deserialized.recoveryKey).toMatch(/^OWNER-REC-[2-9A-Z]{4}-[2-9A-Z]{4}$/);
    expect(getInitials(deserialized.name)).toBe("MA");
  });
});
