"use client";

/* eslint-disable @next/next/no-img-element */
import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Filter,
  ImageIcon,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { SessionUser } from "@/types/auth";
import type {
  InventoryAvailabilityFilter,
  InventoryItemDTO,
  InventoryListResponse,
  InventoryStatus,
} from "@/types/inventory";

type FormState = {
  sku: string;
  name: string;
  description: string;
  category: string;
  rentalPrice: string;
  costPrice: string;
  damageFee: string;
  imageUrl: string;
  totalQuantity: string;
  rentedQuantity: string;
  damagedQuantity: string;
  minimumThreshold: string;
  status: InventoryStatus;
};

type Filters = {
  search: string;
  category: string;
  status: "all" | InventoryStatus;
  availability: InventoryAvailabilityFilter;
  sort: "newest" | "name" | "available" | "category";
};

const emptyForm: FormState = {
  sku: "",
  name: "",
  description: "",
  category: "",
  rentalPrice: "0",
  costPrice: "0",
  damageFee: "0",
  imageUrl: "",
  totalQuantity: "0",
  rentedQuantity: "0",
  damagedQuantity: "0",
  minimumThreshold: "0",
  status: "AVAILABLE",
};

const availabilityOptions: Array<{
  value: InventoryAvailabilityFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "damaged", label: "Damaged" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out" },
];

const statusOptions: Array<{ value: "all" | InventoryStatus; label: string }> =
  [
    { value: "all", label: "Any status" },
    { value: "AVAILABLE", label: "Available" },
    { value: "MAINTENANCE", label: "Maintenance" },
    { value: "OUT_OF_STOCK", label: "Out of stock" },
    { value: "RETIRED", label: "Retired" },
  ];

const formStatusOptions = statusOptions.filter(
  (option): option is { value: InventoryStatus; label: string } =>
    option.value !== "all",
);

const stockStateLabels = {
  available: "Available",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  damaged: "Damaged",
  maintenance: "Maintenance",
  retired: "Retired",
};

const stockStateStyles = {
  available: "bg-emerald-100 text-emerald-800",
  low_stock: "bg-amber-100 text-amber-800",
  out_of_stock: "bg-rose-100 text-rose-800",
  damaged: "bg-orange-100 text-orange-800",
  maintenance: "bg-sky-100 text-sky-800",
  retired: "bg-zinc-200 text-zinc-700",
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function toFormState(item: InventoryItemDTO): FormState {
  return {
    sku: item.sku,
    name: item.name,
    description: item.description ?? "",
    category: item.category ?? "",
    rentalPrice: String(item.rentalPrice),
    costPrice: String(item.costPrice),
    damageFee: String(item.damageFee),
    imageUrl: item.imageUrl ?? "",
    totalQuantity: String(item.totalQuantity),
    rentedQuantity: String(item.rentedQuantity),
    damagedQuantity: String(item.damagedQuantity),
    minimumThreshold: String(item.minimumThreshold),
    status: item.status,
  };
}

async function readError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null);
  return typeof payload?.message === "string" ? payload.message : fallback;
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function InventoryManager({ user }: { user: SessionUser }) {
  const [data, setData] = useState<InventoryListResponse>({
    items: [],
    categories: [],
    summary: {
      totalItems: 0,
      totalOwned: 0,
      totalAvailable: 0,
      totalRented: 0,
      totalDamaged: 0,
      lowStockItems: 0,
    },
  });
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "all",
    status: "all",
    availability: "all",
    sort: "newest",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemDTO | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    return params.toString();
  }, [filters]);

  const availablePreview = Math.max(
    0,
    numberValue(form.totalQuantity) -
      numberValue(form.rentedQuantity) -
      numberValue(form.damagedQuantity),
  );

  const quantityError =
    numberValue(form.rentedQuantity) + numberValue(form.damagedQuantity) >
    numberValue(form.totalQuantity);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/inventory?${queryString}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        await readError(response, "Inventory could not be loaded."),
      );
    }

    const result = (await response.json()) as InventoryListResponse;
    setData(result);
    setLoading(false);
  }, [queryString]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      loadInventory().catch((caught) => {
        if (active) {
          setError((caught as Error).message);
          setLoading(false);
        }
      });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [loadInventory]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function openCreateEditor() {
    setEditingItem(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setIsEditorOpen(true);
  }

  function openEditEditor(item: InventoryItemDTO) {
    setEditingItem(item);
    setForm(toFormState(item));
    setImageFile(null);
    setImagePreview(item.imageUrl);
    setFormError(null);
    setIsEditorOpen(true);
  }

  function closeEditor() {
    if (saving) {
      return;
    }
    setIsEditorOpen(false);
    setEditingItem(null);
    setFormError(null);
    setImageFile(null);
    setImagePreview(null);
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleImageChange(file: File | null) {
    setImageFile(file);
    if (!file) {
      setImagePreview(form.imageUrl || null);
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!imageFile) {
      return form.imageUrl || null;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch("/api/inventory/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Image upload failed."));
    }

    const result = (await response.json()) as { imageUrl: string };
    return result.imageUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (quantityError) {
      setFormError("Rented and damaged quantities cannot exceed total owned.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const imageUrl = await uploadImage();
      const payload = {
        ...form,
        imageUrl,
        rentalPrice: numberValue(form.rentalPrice),
        costPrice: numberValue(form.costPrice),
        damageFee: numberValue(form.damageFee),
        totalQuantity: numberValue(form.totalQuantity),
        rentedQuantity: numberValue(form.rentedQuantity),
        damagedQuantity: numberValue(form.damagedQuantity),
        minimumThreshold: numberValue(form.minimumThreshold),
      };

      const response = await fetch(
        editingItem ? `/api/inventory/${editingItem.id}` : "/api/inventory",
        {
          method: editingItem ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readError(response, "Inventory item could not be saved."),
        );
      }

      setIsEditorOpen(false);
      setEditingItem(null);
      setImageFile(null);
      setImagePreview(null);
      await loadInventory();
    } catch (caught) {
      setFormError((caught as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: InventoryItemDTO) {
    const confirmed = window.confirm(`Delete ${item.name}?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setError(null);

    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          await readError(response, "Inventory item could not be deleted."),
        );
      }

      await loadInventory();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Inventory
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
            Stock control
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Signed in as {user.name ?? user.email}. Track rental stock,
            availability, pricing, images, and damage exposure from one place.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateEditor}
          data-testid="inventory-add-button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Items",
            value: data.summary.totalItems,
            icon: Package,
          },
          {
            label: "Total owned",
            value: data.summary.totalOwned,
            icon: Boxes,
          },
          {
            label: "Available",
            value: data.summary.totalAvailable,
            icon: CheckCircle2,
          },
          {
            label: "Rented out",
            value: data.summary.totalRented,
            icon: Filter,
          },
          {
            label: "Damaged",
            value: data.summary.totalDamaged,
            icon: AlertTriangle,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {metric.label}
              </p>
              <metric.icon className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
              {metric.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_220px_190px_170px]">
          <label className="relative block">
            <span className="sr-only">Search inventory</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder="Search by name, SKU, or category"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </label>

          <label>
            <span className="sr-only">Category</span>
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value="all">All categories</option>
              {data.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Status</span>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as Filters["status"],
                }))
              }
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Sort inventory</span>
            <select
              value={filters.sort}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sort: event.target.value as Filters["sort"],
                }))
              }
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value="newest">Newest</option>
              <option value="name">Name</option>
              <option value="available">Available</option>
              <option value="category">Category</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {availabilityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  availability: option.value,
                }))
              }
              className={`h-9 rounded-lg px-3 text-sm font-medium transition ${
                filters.availability === option.value
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="min-h-[320px]">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-3xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <Package className="h-10 w-10 text-zinc-400" />
            <h2 className="mt-4 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              No inventory items found
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              Add a rental item or adjust the current filters.
            </p>
            <button
              type="button"
              onClick={openCreateEditor}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
            >
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-900">
                  {item.imageUrl ? (
                    <div className="relative h-full w-full">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-zinc-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        {item.sku}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                        {item.name}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        {item.category ?? "Uncategorized"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        stockStateStyles[item.stockState]
                      }`}
                    >
                      {stockStateLabels[item.stockState]}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      ["Owned", item.totalQuantity],
                      ["Avail", item.availableQuantity],
                      ["Rented", item.rentedQuantity],
                      ["Damaged", item.damagedQuantity],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                          {label}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-zinc-500">Rental</p>
                      <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                        {moneyFormatter.format(item.rentalPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Damage fee</p>
                      <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                        {moneyFormatter.format(item.damageFee)}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Utilization</p>
                      <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                        {item.utilizationRate}%
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditEditor(item)}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900 touch-target"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="inline-flex h-10 w-11 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 touch-target"
                      aria-label={`Delete ${item.name}`}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-full w-full max-w-5xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-200 bg-white/95 p-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {editingItem ? "Edit item" : "Add item"}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                  {editingItem?.name ?? "New inventory item"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                aria-label="Close inventory form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              data-testid="inventory-form"
              className="grid gap-6 p-5 lg:grid-cols-[320px_minmax(0,1fr)]"
            >
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="aspect-square relative">
                      {imagePreview ? (
                        <Image src={imagePreview} alt="Inventory preview" fill className="object-cover" />
                      ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-zinc-400" />
                      </div>
                    )}
                  </div>
                </div>

                <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900">
                  <Upload className="h-4 w-4" />
                  Upload image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) =>
                      handleImageChange(event.target.files?.[0] ?? null)
                    }
                  />
                </label>

                <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Available now
                  </p>
                  <p
                    className={`mt-2 text-3xl font-semibold ${
                      quantityError ? "text-rose-600" : "text-zinc-950 dark:text-zinc-50"
                    }`}
                  >
                    {availablePreview}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {formError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                    {formError}
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="SKU">
                    <input
                      title="SKU"
                      value={form.sku}
                      onChange={(event) => updateForm("sku", event.target.value)}
                      required
                      className="field-input"
                    />
                  </Field>
                  <Field label="Name">
                    <input
                      title="Name"
                      value={form.name}
                      onChange={(event) => updateForm("name", event.target.value)}
                      required
                      className="field-input"
                    />
                  </Field>
                  <Field label="Category">
                    <input
                      title="Category"
                      value={form.category}
                      onChange={(event) =>
                        updateForm("category", event.target.value)
                      }
                      list="inventory-categories"
                      className="field-input"
                    />
                    <datalist id="inventory-categories">
                      {data.categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label="Status">
                    <select
                      title="Status"
                      value={form.status}
                      onChange={(event) =>
                        updateForm("status", event.target.value as InventoryStatus)
                      }
                      className="field-input"
                    >
                      {formStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Description">
                  <textarea
                    title="Description"
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    rows={4}
                    className="field-input min-h-28 resize-y py-3"
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Rental price">
                    <input
                      title="Rental price"
                      value={form.rentalPrice}
                      onChange={(event) =>
                        updateForm("rentalPrice", event.target.value)
                      }
                      type="number"
                      min="0"
                      step="0.01"
                      className="field-input"
                    />
                  </Field>
                  <Field label="Cost price">
                    <input
                      title="Cost price"
                      value={form.costPrice}
                      onChange={(event) =>
                        updateForm("costPrice", event.target.value)
                      }
                      type="number"
                      min="0"
                      step="0.01"
                      className="field-input"
                    />
                  </Field>
                  <Field label="Damage fee">
                    <input
                      title="Damage fee"
                      value={form.damageFee}
                      onChange={(event) =>
                        updateForm("damageFee", event.target.value)
                      }
                      type="number"
                      min="0"
                      step="0.01"
                      className="field-input"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Field label="Total owned">
                    <input
                      title="Total owned"
                      value={form.totalQuantity}
                      onChange={(event) =>
                        updateForm("totalQuantity", event.target.value)
                      }
                      type="number"
                      min="0"
                      step="1"
                      className="field-input"
                    />
                  </Field>
                  <Field label="Rented out">
                    <input
                      title="Rented out"
                      value={form.rentedQuantity}
                      onChange={(event) =>
                        updateForm("rentedQuantity", event.target.value)
                      }
                      type="number"
                      min="0"
                      step="1"
                      className="field-input"
                    />
                  </Field>
                  <Field label="Damaged">
                    <input
                      title="Damaged"
                      value={form.damagedQuantity}
                      onChange={(event) =>
                        updateForm("damagedQuantity", event.target.value)
                      }
                      type="number"
                      min="0"
                      step="1"
                      className="field-input"
                    />
                  </Field>
                  <Field label="Low stock at">
                    <input
                      title="Low stock at"
                      value={form.minimumThreshold}
                      onChange={(event) =>
                        updateForm("minimumThreshold", event.target.value)
                      }
                      type="number"
                      min="0"
                      step="1"
                      className="field-input"
                    />
                  </Field>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEditor}
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 px-5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || quantityError}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {saving ? "Saving..." : editingItem ? "Save changes" : "Create item"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const id = React.useId();

  const child = React.isValidElement(children)
    ? React.cloneElement(children as any, { id, title: label, 'aria-labelledby': `${id}-label` })
    : children;

  return (
    <div className="block">
      <label id={`${id}-label`} className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </label>
      {child}
    </div>
  );
}
