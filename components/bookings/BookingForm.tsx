"use client";

import { useEffect, useMemo, useState } from "react";
import type { BookingItemPayload } from "@/types/booking";
import type { InventoryItemDTO } from "@/types/inventory";
import PremiumButton from "@/components/ui/PremiumButton";
import PremiumCard from "@/components/ui/PremiumCard";

const emptyItem = { inventoryItemId: "", quantity: 1, discount: 0, notes: "" };

export default function BookingForm() {
  const [inventory, setInventory] = useState<InventoryItemDTO[]>([]);
  const [items, setItems] = useState<BookingItemPayload[]>([emptyItem]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("0.00");
  const [setupFee, setSetupFee] = useState("0.00");
  const [discount, setDiscount] = useState("0.00");
  const [status, setStatus] = useState("PENDING");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/inventory?availability=available&sort=name")
      .then((response) => response.json())
      .then((data) => setInventory(data.items ?? []))
      .catch(() => setInventory([]));
  }, []);

  const itemOptions = useMemo(() => inventory.map((item) => ({
    id: item.id,
    label: `${item.name} (${item.sku}) — ${item.availableQuantity} available`,
    available: item.availableQuantity,
  })), [inventory]);

  const bookingTotals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const inventoryItem = inventory.find((inventoryRow) => inventoryRow.id === item.inventoryItemId);
      const unitPrice = inventoryItem?.rentalPrice ?? 0;
      const line = Math.max(unitPrice * item.quantity - item.discount, 0);
      return sum + line;
    }, 0);

    const fees = Number(deliveryFee) + Number(setupFee);
    const total = Math.max(subtotal + fees - Number(discount), 0);
    const deposit = Number((total * 0.25).toFixed(2));
    const balance = Number((total - deposit).toFixed(2));
    return { subtotal, total, deposit, balance };
  }, [items, inventory, deliveryFee, setupFee, discount]);

  function updateItem(index: number, updated: Partial<BookingItemPayload>) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...updated } : item)),
    );
  }

  function addItem() {
    setItems((current) => [...current, emptyItem]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const payload = {
      customer: { firstName, lastName, email, phone, company, address },
      eventDate,
      deliveryDate: deliveryDate || null,
      returnDate: returnDate || null,
      status,
      deliveryFee: Number(deliveryFee),
      setupFee: Number(setupFee),
      discount: Number(discount),
      notes,
      items: items.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
        discount: item.discount,
        notes: item.notes,
      })),
    };

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(result?.message ?? "Unable to create booking.");
      return;
    }

    setSuccess("Booking created successfully.");
    setItems([emptyItem]);
    setEventDate("");
    setDeliveryDate("");
    setReturnDate("");
    setDeliveryFee("0.00");
    setSetupFee("0.00");
    setDiscount("0.00");
    setNotes("");
  }

  return (
    <PremiumCard variant="elevated">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Booking system</p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">Create a new rental booking</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Build event rentals with smarter availability, inventory hold handling, and fee-aware totals.
          </p>
        </div>
        <div className="rounded-3xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          Date-based availability, inventory reduction, and partial returns supported.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Customer details</h3>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                First name
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Last name
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Phone
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Company
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Address
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Booking details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Event date
                <input
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Delivery date
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(event) => setDeliveryDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Return date
                <input
                  type="date"
                  value={returnDate}
                  onChange={(event) => setReturnDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In progress</option>
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Fees & discounts</h3>
            <div className="grid gap-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Delivery fee
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryFee}
                  onChange={(event) => setDeliveryFee(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Setup fee
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={setupFee}
                  onChange={(event) => setSetupFee(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Booking discount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">Inventory items</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Add one or more items to the booking and validate availability for the selected dates.</p>
            </div>
            <PremiumButton type="button" onClick={addItem} variant="secondary" size="md">
              Add item
            </PremiumButton>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-[2fr_1fr_1fr_1fr]">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Inventory item
                  <select
                    value={item.inventoryItemId}
                    onChange={(event) => updateItem(index, { inventoryItemId: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    required
                  >
                    <option value="">Select item</option>
                    {itemOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Quantity
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Discount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount}
                    onChange={(event) => updateItem(index, { discount: Number(event.target.value) })}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </label>
                <div className="flex items-end justify-between gap-3">
                  <label className="block w-full text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Notes
                    <input
                      value={item.notes}
                      onChange={(event) => updateItem(index, { notes: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </label>
                  <PremiumButton type="button" onClick={() => removeItem(index)} variant="danger" size="sm">
                    Remove
                  </PremiumButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Booking notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-2 h-28 w-full rounded-3xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="Add delivery instructions, setup details, or customer notes."
            />
          </label>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Items subtotal</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">${bookingTotals.subtotal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Fees</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">${(Number(deliveryFee) + Number(setupFee)).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Deposit</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">${bookingTotals.deposit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Total due</p>
              <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">${bookingTotals.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-3xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
            {success}
          </div>
        ) : null}

        <PremiumButton type="submit" isLoading={submitting} fullWidth>
          {submitting ? "Creating booking..." : "Create booking"}
        </PremiumButton>
      </form>
    </PremiumCard>
  );
}
