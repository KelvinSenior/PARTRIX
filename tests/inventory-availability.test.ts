import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    bookingItem: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));

import { getInventoryAvailability } from "@/services/inventoryAvailability";
import { inventoryFiltersSchema } from "@/lib/inventoryValidation";

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);
const stock = {
  id: "item-a",
  status: "AVAILABLE" as const,
  totalQuantity: 10,
  damagedQuantity: 0,
  rentedQuantity: 0,
};

function reservation({
  eventDate = "2026-10-10",
  deliveryDate = null,
  returnDate = "2026-10-12",
  quantity = 4,
  returnedQuantity = 0,
  status = "CONFIRMED",
  delivery = null,
}: {
  eventDate?: string;
  deliveryDate?: string | null;
  returnDate?: string | null;
  quantity?: number;
  returnedQuantity?: number;
  status?: string;
  delivery?: { scheduledAt: Date; status: string } | null;
} = {}) {
  return {
    inventoryItemId: "item-a",
    quantity,
    returnedQuantity,
    booking: {
      eventDate: date(eventDate),
      deliveryDate: deliveryDate ? date(deliveryDate) : null,
      returnDate: returnDate ? date(returnDate) : null,
      status,
      delivery,
    },
  };
}

describe("scheduled inventory availability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.bookingItem.findMany.mockResolvedValue([]);
  });

  it("validates date filters before querying period availability", () => {
    const baseFilters = {
      search: "",
      category: "all",
      status: "all",
      availability: "all",
      sort: "newest",
    };

    expect(inventoryFiltersSchema.safeParse({
      ...baseFilters,
      eventDate: "2026-10-10",
      returnDate: "2026-10-12",
    }).success).toBe(true);
    expect(inventoryFiltersSchema.safeParse({
      ...baseFilters,
      eventDate: "2026-10-12",
      returnDate: "2026-10-10",
    }).success).toBe(false);
    expect(inventoryFiltersSchema.safeParse({
      ...baseFilters,
      eventDate: "2026-02-31",
    }).success).toBe(false);
  });

  it("allows non-overlapping bookings and uses inclusive return dates", async () => {
    prisma.bookingItem.findMany.mockResolvedValue([reservation()]);

    const adjacent = await getInventoryAvailability(
      "org-a",
      [stock],
      { eventDate: date("2026-10-13"), returnDate: date("2026-10-14") },
      { now: date("2026-10-01") },
    );
    const overlappingReturnDay = await getInventoryAvailability(
      "org-a",
      [stock],
      { eventDate: date("2026-10-12"), returnDate: date("2026-10-13") },
      { now: date("2026-10-01") },
    );

    expect(adjacent.get("item-a")).toEqual({ availableQuantity: 10, committedQuantity: 0 });
    expect(overlappingReturnDay.get("item-a")).toEqual({ availableQuantity: 6, committedQuantity: 4 });
  });

  it("keeps future reservations out of physical stock but checks overlaps for selected booking dates", async () => {
    prisma.bookingItem.findMany.mockResolvedValue([
      reservation({ eventDate: "2026-10-10", returnDate: "2026-10-10", quantity: 70 }),
      reservation({ eventDate: "2026-10-10", returnDate: "2026-10-10", quantity: 70 }),
    ]);

    const physicalStock = await getInventoryAvailability(
      "org-a",
      [{ ...stock, totalQuantity: 140 }],
      { eventDate: date("2026-10-01"), returnDate: date("2026-10-01") },
      { now: date("2026-10-01"), includeReservations: false },
    );
    const selectedEventDate = await getInventoryAvailability(
      "org-a",
      [{ ...stock, totalQuantity: 140 }],
      { eventDate: date("2026-10-10"), returnDate: date("2026-10-10") },
      { now: date("2026-10-01") },
    );

    expect(physicalStock.get("item-a")).toEqual({
      availableQuantity: 140,
      committedQuantity: 0,
    });
    expect(selectedEventDate.get("item-a")).toEqual({
      availableQuantity: 0,
      committedQuantity: 140,
    });
  });

  it("uses the earlier delivery schedule and keeps overdue outstanding units committed", async () => {
    prisma.bookingItem.findMany
      .mockResolvedValueOnce([reservation({
        eventDate: "2026-10-10",
        deliveryDate: "2026-10-09",
        returnDate: "2026-10-12",
        quantity: 3,
      })])
      .mockResolvedValueOnce([reservation({
        eventDate: "2026-10-10",
        returnDate: "2026-10-12",
        quantity: 3,
      })]);

    const earlyDelivery = await getInventoryAvailability(
      "org-a",
      [stock],
      { eventDate: date("2026-10-09"), returnDate: date("2026-10-09") },
      { now: date("2026-10-01") },
    );
    const overdue = await getInventoryAvailability(
      "org-a",
      [stock],
      { eventDate: date("2026-10-20"), returnDate: date("2026-10-21") },
      { now: date("2026-10-13") },
    );

    expect(earlyDelivery.get("item-a")).toEqual({ availableQuantity: 7, committedQuantity: 3 });
    expect(overdue.get("item-a")).toEqual({ availableQuantity: 7, committedQuantity: 3 });
  });

  it("accounts for partial returns, damaged stock, and physical stock already out", async () => {
    prisma.bookingItem.findMany.mockResolvedValue([
      reservation({ quantity: 5, returnedQuantity: 2 }),
      reservation({
        status: "IN_PROGRESS",
        quantity: 2,
        delivery: { scheduledAt: date("2026-10-10"), status: "DELIVERED" },
      }),
    ]);

    const result = await getInventoryAvailability(
      "org-a",
      [{ ...stock, totalQuantity: 10, damagedQuantity: 2, rentedQuantity: 5 }],
      { eventDate: date("2026-10-11"), returnDate: date("2026-10-11") },
      { now: date("2026-10-01") },
    );

    expect(result.get("item-a")).toEqual({ availableQuantity: 0, committedQuantity: 8 });
    expect(prisma.bookingItem.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        organizationId: "org-a",
        booking: expect.objectContaining({
          organizationId: "org-a",
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        }),
      }),
    }));
  });

  it("scopes reservations to the tenant and excludes the booking being edited", async () => {
    await getInventoryAvailability(
      "org-a",
      [stock],
      { eventDate: date("2026-10-10"), returnDate: date("2026-10-12") },
      { now: date("2026-10-01"), excludeBookingId: "booking-a" },
    );

    expect(prisma.bookingItem.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        organizationId: "org-a",
        booking: expect.objectContaining({
          organizationId: "org-a",
          id: { not: "booking-a" },
        }),
      }),
    }));
  });
});
