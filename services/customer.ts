import { prisma } from "@/lib/prisma";
import { requireOrganizationContext } from "@/lib/tenant";
import type { CustomerPayload, CustomerDTO, CustomerDetailDTO, CustomerSearchParams } from "@/types/customer";

function decimalToNumber(value: any): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toNumber" in value) return Number(value.toNumber());
  return Number(value.toString());
}

function serializeCustomer(customer: any): CustomerDTO {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email ?? null,
    phone: customer.phone ?? null,
    company: customer.company ?? null,
    address: customer.address ?? null,
    notes: customer.notes ?? null,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

export async function createCustomer(payload: CustomerPayload): Promise<CustomerDTO> {
  const user = await requireOrganizationContext();

  const customer = await prisma.customer.create({
    data: {
      organizationId: user.organizationId!,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      company: payload.company ?? null,
      address: payload.address ?? null,
      notes: payload.notes ?? null,
    },
  });

  return serializeCustomer(customer);
}

export async function getCustomer(id: string): Promise<CustomerDTO | null> {
  const user = await requireOrganizationContext();
  const customer = await prisma.customer.findFirst({ where: { id, organizationId: user.organizationId! } });
  return customer ? serializeCustomer(customer) : null;
}

export async function updateCustomer(id: string, payload: CustomerPayload): Promise<CustomerDTO> {
  const user = await requireOrganizationContext();
  const existing = await prisma.customer.findFirst({ where: { id, organizationId: user.organizationId! } });
  if (!existing) {
    throw new Error("Customer not found in this workspace.");
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      company: payload.company ?? null,
      address: payload.address ?? null,
      notes: payload.notes ?? null,
    },
  });

  return serializeCustomer(customer);
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const user = await requireOrganizationContext();
    const existing = await prisma.customer.findFirst({ where: { id, organizationId: user.organizationId! } });
    if (!existing) {
      return false;
    }

    await prisma.customer.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function listCustomers(params: CustomerSearchParams = {}): Promise<{ customers: CustomerDTO[]; total: number }> {
  const user = await requireOrganizationContext();
  const { query, sortBy = "createdAt", order = "desc", limit = 20, offset = 0 } = params;

  const where: any = { organizationId: user.organizationId! };
  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { company: { contains: query, mode: "insensitive" } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { [sortBy]: order },
    take: limit,
    skip: offset,
  });

  const total = await prisma.customer.count({ where });

  return {
    customers: customers.map(serializeCustomer),
    total,
  };
}

export async function getCustomerDetail(id: string): Promise<CustomerDetailDTO | null> {
  const user = await requireOrganizationContext();
  const customer = await prisma.customer.findFirst({
    where: { id, organizationId: user.organizationId! },
    include: {
      bookings: {
        include: {
          bookingItems: true,
        },
      },
    },
  });

  if (!customer) return null;

  const bookingCount = customer.bookings.length;
  const totalSpent = customer.bookings.reduce((sum, b) => sum + decimalToNumber(b.totalAmount), 0);
  const outstandingBalance = customer.bookings.reduce((sum, b) => sum + decimalToNumber(b.balanceDue), 0);
  const lastBookingDate = customer.bookings.length > 0 ? customer.bookings[0].eventDate.toISOString() : null;

  return {
    ...serializeCustomer(customer),
    bookingCount,
    totalSpent,
    outstandingBalance,
    lastBookingDate,
  };
}

export interface CustomerBookingSummary {
  id: string;
  bookingNumber: string;
  eventDate: string;
  status: string;
  totalAmount: number;
  balanceDue: number;
  itemCount: number;
}

export async function getCustomerBookings(id: string): Promise<CustomerBookingSummary[]> {
  const user = await requireOrganizationContext();
  const bookings = await prisma.booking.findMany({
    where: { customerId: id, organizationId: user.organizationId! },
    include: {
      bookingItems: {
        include: { inventoryItem: true },
      },
    },
    orderBy: { eventDate: "desc" },
  });

  return bookings.map((b) => ({
    id: b.id,
    bookingNumber: b.bookingNumber,
    eventDate: b.eventDate.toISOString(),
    status: b.status,
    totalAmount: decimalToNumber(b.totalAmount),
    balanceDue: decimalToNumber(b.balanceDue),
    itemCount: b.bookingItems.length,
  }));
}

export async function getCustomerAnalytics(id: string) {
  const user = await requireOrganizationContext();
  const bookings = await prisma.booking.findMany({
    where: { customerId: id, organizationId: user.organizationId! },
    include: { payments: true },
  });

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + decimalToNumber(b.totalAmount), 0);
  const totalPaid = bookings.reduce((sum, b) => {
    const paid = b.payments.reduce((s, p) => s + decimalToNumber(p.amount), 0);
    return sum + paid;
  }, 0);
  const totalOutstanding = bookings.reduce((sum, b) => sum + decimalToNumber(b.balanceDue), 0);
  const avgOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Bookings by status
  const statusCounts: Record<string, number> = {};
  for (const b of bookings) {
    statusCounts[b.status] = (statusCounts[b.status] ?? 0) + 1;
  }

  return {
    totalBookings,
    totalRevenue,
    totalPaid,
    totalOutstanding,
    avgOrderValue,
    statusCounts,
  };
}
