"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingItemPayload } from "@/types/booking";
import type { InventoryItemDTO } from "@/types/inventory";
import type { SettingsDTO } from "@/types/settings";
import PremiumButton from "@/components/ui/PremiumButton";
import PremiumCard from "@/components/ui/PremiumCard";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  CreditCard,
  Package,
  Save,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

const steps = [
  { key: "customer", title: "Customer", description: "Select or add a customer" },
  { key: "details", title: "Rental details", description: "Pick the rental window" },
  { key: "inventory", title: "Inventory", description: "Choose what to rent" },
  { key: "pricing", title: "Pricing", description: "Review the estimate" },
  { key: "payment", title: "Payment", description: "Confirm deposit and status" },
  { key: "review", title: "Review", description: "Confirm everything" },
] as const;

export default function BookingForm({ settings }: { settings: SettingsDTO }) {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItemDTO[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<BookingItemPayload[]>([]);
  const [activeSettings, setActiveSettings] = useState(settings);
  const [activeStep, setActiveStep] = useState(0);

  const [customerMode, setCustomerMode] = useState<"new" | "existing">("new");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");

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

    fetch("/api/customers?limit=100")
      .then((response) => response.json())
      .then((data) => setCustomers(data.customers ?? []))
      .catch(() => setCustomers([]));

    fetch("/api/settings")
      .then((response) => response.json())
      .then((data) => {
        if (data?.settings) {
          setActiveSettings(data.settings);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!eventDate || returnDate) {
      return;
    }

    const defaultReturnDate = new Date(`${eventDate}T00:00:00`);
    defaultReturnDate.setDate(defaultReturnDate.getDate() + Math.max(activeSettings.rental.defaultRentalTermDays - 1, 0));
    setReturnDate(defaultReturnDate.toISOString().slice(0, 10));
  }, [eventDate, returnDate, activeSettings.rental.defaultRentalTermDays]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("partrix-booking-draft");
      if (!stored) return;
      const draft = JSON.parse(stored);
      if (draft?.firstName) setFirstName(draft.firstName ?? "");
      if (draft?.lastName) setLastName(draft.lastName ?? "");
      if (draft?.email) setEmail(draft.email ?? "");
      if (draft?.phone) setPhone(draft.phone ?? "");
      if (draft?.company) setCompany(draft.company ?? "");
      if (draft?.address) setAddress(draft.address ?? "");
      if (draft?.eventDate) setEventDate(draft.eventDate ?? "");
      if (draft?.deliveryDate) setDeliveryDate(draft.deliveryDate ?? "");
      if (draft?.returnDate) setReturnDate(draft.returnDate ?? "");
      if (draft?.deliveryFee) setDeliveryFee(draft.deliveryFee ?? "0.00");
      if (draft?.setupFee) setSetupFee(draft.setupFee ?? "0.00");
      if (draft?.discount) setDiscount(draft.discount ?? "0.00");
      if (draft?.notes) setNotes(draft.notes ?? "");
      if (draft?.status) setStatus(draft.status ?? "PENDING");
      if (draft?.selectedCustomerId) setSelectedCustomerId(draft.selectedCustomerId ?? "");
      if (draft?.customerMode) setCustomerMode(draft.customerMode ?? "new");
      if (draft?.customerSearch) setCustomerSearch(draft.customerSearch ?? "");
      if (draft?.items) setItems(draft.items ?? []);
      setSuccess("Draft restored from your last session.");
    } catch {
      // ignore invalid draft data
    }
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers.slice(0, 8);
    return customers.filter((customer) => {
      const fullName = `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.toLowerCase();
      const company = `${customer.company ?? ""}`.toLowerCase();
      const email = `${customer.email ?? ""}`.toLowerCase();
      return fullName.includes(query) || company.includes(query) || email.includes(query);
    }).slice(0, 8);
  }, [customerSearch, customers]);

  const filteredInventory = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase();
    if (!query) return inventory;
    return inventory.filter((item) => {
      const haystack = `${item.name ?? ""} ${item.sku ?? ""} ${item.category ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [inventorySearch, inventory]);

  const bookingTotals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const inventoryItem = inventory.find((inventoryRow) => inventoryRow.id === item.inventoryItemId);
      const unitPrice = inventoryItem?.rentalPrice ?? 0;
      const line = Math.max(unitPrice * item.quantity - item.discount, 0);
      return sum + line;
    }, 0);

    const fees = Number(deliveryFee) + Number(setupFee);
    const total = Math.max(subtotal + fees - Number(discount), 0);
    const deposit = Number(((total * activeSettings.deposit.requiredDepositPercent) / 100).toFixed(2));
    const balance = Number((total - deposit).toFixed(2));
    return { subtotal, total, deposit, balance };
  }, [items, inventory, deliveryFee, setupFee, discount, activeSettings.deposit.requiredDepositPercent]);

  const selectedItems = items.filter((item) => item.inventoryItemId);
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);

  function updateItem(index: number, updated: Partial<BookingItemPayload>) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...updated } : item)),
    );
  }

  function addItemToPlan(inventoryItem: InventoryItemDTO) {
    const existing = items.find((item) => item.inventoryItemId === inventoryItem.id);
    if (existing) {
      setItems((current) => current.map((item) => item.inventoryItemId === inventoryItem.id ? { ...item, quantity: item.quantity + 1 } : item));
      return;
    }
    setItems((current) => [...current, { inventoryItemId: inventoryItem.id, quantity: 1, discount: 0, notes: "" }]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function clearForm() {
    setActiveStep(0);
    setItems([]);
    setCustomerMode("new");
    setSelectedCustomerId("");
    setCustomerSearch("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setAddress("");
    setEventDate("");
    setDeliveryDate("");
    setReturnDate("");
    setDeliveryFee("0.00");
    setSetupFee("0.00");
    setDiscount("0.00");
    setStatus("PENDING");
    setNotes("");
    setError(null);
    setSuccess("Booking flow cleared.");
    window.localStorage.removeItem("partrix-booking-draft");
  }

  function saveDraft() {
    const draft = {
      customerMode,
      selectedCustomerId,
      customerSearch,
      firstName,
      lastName,
      email,
      phone,
      company,
      address,
      eventDate,
      deliveryDate,
      returnDate,
      deliveryFee,
      setupFee,
      discount,
      status,
      notes,
      items,
    };
    window.localStorage.setItem("partrix-booking-draft", JSON.stringify(draft));
    setError(null);
    setSuccess("Draft saved locally.");
  }

  function validateStep(stepIndex: number) {
    switch (stepIndex) {
      case 0:
        if (customerMode === "existing") {
          if (!selectedCustomerId) {
            setError("Select a customer before continuing.");
            return false;
          }
        } else if (!firstName.trim() || !lastName.trim()) {
          setError("Add a first and last name for the new customer.");
          return false;
        }
        break;
      case 1:
        if (!eventDate) {
          setError("Choose an event date to continue.");
          return false;
        }
        break;
      case 2:
        if (selectedItems.length === 0) {
          setError("Choose at least one inventory item before continuing.");
          return false;
        }
        break;
      default:
        break;
    }
    setError(null);
    return true;
  }

  function handleNext() {
    if (!validateStep(activeStep)) return;
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function handlePrevious() {
    setActiveStep((current) => Math.max(current - 1, 0));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const customerPayload = customerMode === "existing"
      ? { id: selectedCustomerId }
      : { firstName, lastName, email: email || null, phone, company, address };

    const payload = {
      customer: customerPayload,
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
    setItems([]);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setAddress("");
    setSelectedCustomerId("");
    setCustomerSearch("");
    setEventDate("");
    setDeliveryDate("");
    setReturnDate("");
    setDeliveryFee("0.00");
    setSetupFee("0.00");
    setDiscount("0.00");
    setNotes("");
    setActiveStep(0);
    window.localStorage.removeItem("partrix-booking-draft");
    router.refresh();
  }

  const currentStep = steps[activeStep];

  return (
    <PremiumCard variant="elevated">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Booking system</p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">Create a new rental booking</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Guided workflow for repeat bookings with less scrolling and faster handoffs.
          </p>
        </div>
        <div className="rounded-3xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-700 shadow-sm dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
          {activeSettings.rental.allowPartialReturns ? "Partial returns supported." : "Returns must be completed in full."}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-3xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
        {steps.map((step, index) => {
          const isDone = index < activeStep;
          const isActive = index === activeStep;
          return (
            <div key={step.key} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${isActive ? "border-cyan-400 bg-cyan-500 text-white" : isDone ? "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-zinc-300 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"}`}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>
              <span className={`text-sm font-medium ${isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-zinc-400"}`}>
                {step.title}
              </span>
              {index < steps.length - 1 ? <span className="mx-1 text-zinc-400">→</span> : null}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            {currentStep.key === "customer" ? <UserRound className="h-4 w-4 text-cyan-600" /> : null}
            {currentStep.key === "details" ? <CalendarDays className="h-4 w-4 text-cyan-600" /> : null}
            {currentStep.key === "inventory" ? <Package className="h-4 w-4 text-cyan-600" /> : null}
            {currentStep.key === "pricing" ? <Sparkles className="h-4 w-4 text-cyan-600" /> : null}
            {currentStep.key === "payment" ? <CreditCard className="h-4 w-4 text-cyan-600" /> : null}
            {currentStep.key === "review" ? <CheckCircle2 className="h-4 w-4 text-cyan-600" /> : null}
            <span>{currentStep.title}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-zinc-400">{currentStep.description}</p>
        </div>

        {activeStep === 0 ? (
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex rounded-2xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                <button type="button" onClick={() => setCustomerMode("new")} className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${customerMode === "new" ? "bg-cyan-500 text-white shadow-sm" : "text-zinc-600 dark:text-zinc-300"}`}>
                  New customer
                </button>
                <button type="button" onClick={() => setCustomerMode("existing")} className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${customerMode === "existing" ? "bg-cyan-500 text-white shadow-sm" : "text-zinc-600 dark:text-zinc-300"}`}>
                  Existing customer
                </button>
              </div>

              {customerMode === "existing" ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Search customer
                    <input
                      value={customerSearch}
                      onChange={(event) => setCustomerSearch(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                      placeholder="Type a name or email"
                    />
                  </label>
                  <div className="space-y-2">
                    {filteredCustomers.map((customer) => (
                      <button key={customer.id} type="button" onClick={() => setSelectedCustomerId(customer.id)} className={`flex w-full items-start justify-between rounded-2xl border px-3 py-3 text-left text-sm transition ${selectedCustomerId === customer.id ? "border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200" : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"}`}>
                        <span>
                          <span className="block font-semibold">{customer.firstName} {customer.lastName}</span>
                          <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">{customer.email ?? customer.phone ?? customer.company}</span>
                        </span>
                        <Circle className={`mt-1 h-4 w-4 ${selectedCustomerId === customer.id ? "text-cyan-600" : "text-zinc-400"}`} />
                      </button>
                    ))}
                  </div>
                  {selectedCustomer ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200">
                      <p className="font-semibold">Selected: {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                      <p className="mt-1 text-xs">{selectedCustomer.email || selectedCustomer.phone || selectedCustomer.company || "Customer ready for booking"}</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    First name
                    <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" required />
                  </label>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Last name
                    <input value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" required />
                  </label>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
                  </label>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Phone
                    <input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
                  </label>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
                    Company
                    <input value={company} onChange={(event) => setCompany(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
                  </label>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
                    Address
                    <input value={address} onChange={(event) => setAddress(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
                  </label>
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick guidance</p>
              <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-zinc-400">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-medium text-slate-900 dark:text-white">Fastest route</p>
                  <p className="mt-1">Choose an existing customer to skip repeated entry and keep the flow moving.</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-medium text-slate-900 dark:text-white">What comes next</p>
                  <p className="mt-1">After this step you’ll pick dates and the inventory for the rental.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeStep === 1 ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
            <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
                  Event date
                  <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" required />
                </label>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Delivery date
                  <input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
                </label>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Return date
                  <input type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
                </label>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
                  Booking status
                  <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In progress</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Rental notes</p>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-3 h-36 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" placeholder="Add delivery instructions, setup details, or customer notes." />
            </div>
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Search inventory
                <input
                  value={inventorySearch}
                  onChange={(event) => setInventorySearch(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="Search by name, SKU or category"
                />
              </label>
              {inventory.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">Inventory is loading…</div>
              ) : filteredInventory.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">No inventory matches that search.</div>
              ) : (
                filteredInventory.map((item) => (
                  <button key={item.id} type="button" onClick={() => addItemToPlan(item)} className="flex w-full items-start justify-between rounded-3xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-cyan-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{item.sku}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{item.category ?? "Inventory item"}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-zinc-500">
                        <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">{item.availableQuantity} available</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">GHC{item.rentalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="ml-3 rounded-2xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">Add</div>
                  </button>
                ))
              )}
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Selected items</p>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{selectedItems.length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {selectedItems.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">No items selected yet. Tap any card to add it to the booking.</p>
                ) : (
                  selectedItems.map((item, index) => {
                    const inventoryItem = inventory.find((inventoryRow) => inventoryRow.id === item.inventoryItemId);
                    return (
                      <div key={`${item.inventoryItemId}-${index}`} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{inventoryItem?.name ?? "Inventory item"}</p>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Qty {item.quantity}</p>
                          </div>
                          <button type="button" onClick={() => removeItem(index)} className="rounded-full p-1 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Quantity
                            <input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
                          </label>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Discount
                            <input type="number" min="0" step="0.01" value={item.discount} onChange={(event) => updateItem(index, { discount: Number(event.target.value) })} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
                          </label>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : null}

        {activeStep === 3 ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs uppercase tracking-[0.26em] text-zinc-500 dark:text-zinc-400">Items subtotal</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">GHC{bookingTotals.subtotal.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs uppercase tracking-[0.26em] text-zinc-500 dark:text-zinc-400">Fees</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">GHC{(Number(deliveryFee) + Number(setupFee)).toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs uppercase tracking-[0.26em] text-zinc-500 dark:text-zinc-400">Deposit</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">GHC{bookingTotals.deposit.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs uppercase tracking-[0.26em] text-zinc-500 dark:text-zinc-400">Grand total</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">GHC{bookingTotals.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Discounts & fees</p>
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Delivery fee
                  <input type="number" min="0" step="0.01" value={deliveryFee} onChange={(event) => setDeliveryFee(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" />
                </label>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Setup fee
                  <input type="number" min="0" step="0.01" value={setupFee} onChange={(event) => setSetupFee(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" />
                </label>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Booking discount
                  <input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" />
                </label>
              </div>
            </div>
          </div>
        ) : null}

        {activeStep === 4 ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Deposit and payment overview</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-zinc-400">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-semibold text-slate-900 dark:text-white">Deposit required</p>
                  <p className="mt-1">GHC{bookingTotals.deposit.toFixed(2)} at {activeSettings.deposit.requiredDepositPercent}%</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-semibold text-slate-900 dark:text-white">Remaining balance</p>
                  <p className="mt-1">GHC{bookingTotals.balance.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-semibold text-slate-900 dark:text-white">Booking status</p>
                  <p className="mt-1">{status}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Next steps</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-zinc-400">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">Payment collection can be logged after the booking is created from the booking detail view.</div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">Deposit expectations stay linked to the existing business rules and are calculated automatically.</div>
              </div>
            </div>
          </div>
        ) : null}

        {activeStep === 5 ? (
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Booking summary</p>
              <div className="space-y-2 text-sm text-slate-600 dark:text-zinc-400">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-semibold text-slate-900 dark:text-white">Customer</p>
                  <p className="mt-1">{customerMode === "existing" && selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : `${firstName} ${lastName}`}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-semibold text-slate-900 dark:text-white">Dates</p>
                  <p className="mt-1">Event {eventDate || "Not set"} · Delivery {deliveryDate || "Not set"} · Return {returnDate || "Not set"}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-semibold text-slate-900 dark:text-white">Items</p>
                  <p className="mt-1">{selectedItems.length} selected item{selectedItems.length === 1 ? "" : "s"}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-semibold text-slate-900 dark:text-white">Pricing</p>
                  <p className="mt-1">Subtotal GHC{bookingTotals.subtotal.toFixed(2)} · Deposit GHC{bookingTotals.deposit.toFixed(2)} · Total GHC{bookingTotals.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Ready to create</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-zinc-400">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">Your booking will be created with the same pricing, deposit, and inventory rules already used by the app.</div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">You can still adjust quantities or fees from the previous steps before confirming.</div>
              </div>
            </div>
          </div>
        ) : null}

        {(error || success) ? (
          <div className="space-y-2">
            {error ? <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">{error}</div> : null}
            {success ? <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">{success}</div> : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <div className="flex flex-wrap gap-2">
            <PremiumButton type="button" variant="ghost" size="md" onClick={handlePrevious} disabled={activeStep === 0}>
              <ArrowLeft className="h-4 w-4" /> Previous
            </PremiumButton>
            <PremiumButton type="button" variant="secondary" size="md" onClick={saveDraft}>
              <Save className="h-4 w-4" /> Save draft
            </PremiumButton>
            <PremiumButton type="button" variant="ghost" size="md" onClick={clearForm}>
              <X className="h-4 w-4" /> Cancel
            </PremiumButton>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeStep < steps.length - 1 ? (
              <PremiumButton type="button" variant="primary" size="md" onClick={handleNext}>
                Next <ArrowRight className="h-4 w-4" />
              </PremiumButton>
            ) : (
              <PremiumButton type="submit" isLoading={submitting} variant="primary" size="md">
                {submitting ? "Creating booking..." : "Confirm booking"}
              </PremiumButton>
            )}
          </div>
        </div>
      </form>
    </PremiumCard>
  );
}
