"use client";

import { useState } from "react";
import { Button, FormField, Input, Textarea } from "@/components/ui";

interface CustomerFormProps {
  initialData?: {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string;
    company?: string;
    address?: string;
    notes?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function CustomerForm({ initialData, onSubmit, isLoading }: CustomerFormProps) {
  const [formData, setFormData] = useState(initialData ?? { firstName: "", lastName: "", email: "", phone: "", company: "", address: "", notes: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await onSubmit(formData);
    } catch (err) {
      setError((err as Error).message ?? "Failed to save customer");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-700/40 dark:bg-rose-950/50 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First Name" htmlFor="first-name">
          <Input
            id="first-name"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </FormField>
        <FormField label="Last Name" htmlFor="last-name">
          <Input
            id="last-name"
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={formData.email ?? ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value || null })}
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            value={formData.phone ?? ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </FormField>
      </div>

      <FormField label="Company" htmlFor="company">
        <Input
          id="company"
          type="text"
          value={formData.company ?? ""}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </FormField>

      <FormField label="Address" htmlFor="address">
        <Textarea
          id="address"
          rows={3}
          value={formData.address ?? ""}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </FormField>

      <FormField label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          rows={4}
          value={formData.notes ?? ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </FormField>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save customer"}
      </Button>
    </form>
  );
}
