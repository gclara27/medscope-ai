import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "./api";
import { getSupportContact } from "./support";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
    },
  };
});

describe("getSupportContact", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it("fetches support contact email from API", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { support_contact_email: "help@hospital.org" },
    });

    const contact = await getSupportContact();

    expect(api.get).toHaveBeenCalledWith("/support/contact");
    expect(contact.support_contact_email).toBe("help@hospital.org");
  });
});
