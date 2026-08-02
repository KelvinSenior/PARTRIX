"use client";

import { useMemo, useState } from "react";
import { Button, FormField, Input, Textarea } from "@/components/ui";

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  notes?: string | null;
}

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
  const emptyFormData: CustomerFormData = { firstName: "", lastName: "", email: "", phone: "", company: "", address: "", notes: "" };
  const [formData, setFormData] = useState<CustomerFormData>(() => ({
    ...emptyFormData,
    ...initialData,
    firstName: initialData?.firstName ?? "",
    lastName: initialData?.lastName ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    company: initialData?.company ?? "",
    address: initialData?.address ?? "",
    notes: initialData?.notes ?? "",
  }));
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validationRules = useMemo(() => ({
    firstName: (value: string) => {
      if (!value.trim()) return "Please enter the customer's first name.";
      return "";
    },
    phone: (value: string) => {
      if (!value.trim()) return "Please enter a phone number.";
      if (!/^[\d\s+\-().]*$/.test(value)) return "Phone number contains invalid characters.";
      return "";
    },
    email: (value: string) => {
      if (!value.trim()) return "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
      return "";
    },
    lastName: (value: string) => {
      if (!value.trim()) return "";
      if (!/^[a-zA-Z\s'-]+$/.test(value)) return "Last name can only contain letters, spaces, hyphens, and apostrophes.";
      return "";
    },
  }), []);

  function validateForm(data: CustomerFormData) {
    const nextErrors: Record<string, string> = {};
    const firstName = String(data.firstName ?? "").trim();
    const lastName = String(data.lastName ?? "").trim();
    const email = String(data.email ?? "").trim();
    const phone = String(data.phone ?? "").trim();

    const firstNameError = validationRules.firstName(firstName);
    if (firstNameError) nextErrors.firstName = firstNameError;

    const phoneError = validationRules.phone(phone);
    if (phoneError) nextErrors.phone = phoneError;

    const emailError = validationRules.email(email);
    if (emailError) nextErrors.email = emailError;

    const lastNameError = validationRules.lastName(lastName);
    if (lastNameError) nextErrors.lastName = lastNameError;

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function updateField(key: keyof CustomerFormData, value: string | null) {
    setFormData((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validateForm(formData)) {
      setError("Please fix the highlighted fields before saving.");
      return;
    }
    try {
      await onSubmit({
        ...formData,
        firstName: String(formData.firstName ?? "").trim(),
        lastName: String(formData.lastName ?? "").trim() || null,
        email: String(formData.email ?? "").trim() || null,
        phone: String(formData.phone ?? "").trim(),
        company: String(formData.company ?? "").trim() || null,
        address: String(formData.address ?? "").trim() || null,
        notes: String(formData.notes ?? "").trim() || null,
      });
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
        <FormField label="First Name" htmlFor="first-name" required error={fieldErrors.firstName}>
          <Input
            id="first-name"
            type="text"
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            aria-invalid={Boolean(fieldErrors.firstName)}
          />
        </FormField>
        <FormField label="Last Name" htmlFor="last-name" error={fieldErrors.lastName}>
          <Input
            id="last-name"
            type="text"
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            aria-invalid={Boolean(fieldErrors.lastName)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            value={formData.email ?? ""}
            onChange={(e) => updateField("email", e.target.value || null)}
            aria-invalid={Boolean(fieldErrors.email)}
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone" required error={fieldErrors.phone}>
          <Input
            id="phone"
            type="tel"
            value={formData.phone ?? ""}
            onChange={(e) => updateField("phone", e.target.value)}
            aria-invalid={Boolean(fieldErrors.phone)}
          />
        </FormField>
      </div>

      <FormField label="Company" htmlFor="company">
        <Input
          id="company"
          type="text"
          value={formData.company ?? ""}
          onChange={(e) => updateField("company", e.target.value)}
        />
      </FormField>

      <FormField label="Address" htmlFor="address">
        <Textarea
          id="address"
          rows={3}
          value={formData.address ?? ""}
          onChange={(e) => updateField("address", e.target.value)}
        />
      </FormField>

      <FormField label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          rows={4}
          value={formData.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </FormField>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save customer"}
      </Button>
    </form>
  );
}
