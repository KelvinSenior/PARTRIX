import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUser, updateBookingStatus, updateBookingItems } = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  updateBookingStatus: vi.fn(),
  updateBookingItems: vi.fn(),
}));

vi.mock("@/lib/apiAuth", () => ({ getAuthenticatedUser }));
vi.mock("@/services/booking", () => ({
  getBooking: vi.fn(),
  returnBookingItems: vi.fn(),
  cancelBooking: vi.fn(),
  updateBookingStatus,
  updateBookingItems,
}));

import { PATCH } from "@/app/api/bookings/[id]/route";

const bookingId = "123e4567-e89b-12d3-a456-426614174000";

describe("booking update route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ id: "user-a", organizationId: "org-a" });
    updateBookingStatus.mockResolvedValue({ id: bookingId, status: "CONFIRMED" });
  });

  it.each(["CONFIRMED", "NO_SHOW"])(
    "accepts an updateStatus request for %s without items",
    async (status) => {
      const response = await PATCH(
        new Request(`http://localhost/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "updateStatus", status }),
        }),
        { params: Promise.resolve({ id: bookingId }) },
      );

      expect(response.status).toBe(200);
      expect(updateBookingStatus).toHaveBeenCalledWith(bookingId, status);
      expect(updateBookingItems).not.toHaveBeenCalled();
    },
  );

  it("requires items when the action is updateItems", async () => {
    const response = await PATCH(
      new Request(`http://localhost/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateItems" }),
      }),
      { params: Promise.resolve({ id: bookingId }) },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      message: "Items are required for updateItems action.",
    });
    expect(updateBookingItems).not.toHaveBeenCalled();
  });
});
