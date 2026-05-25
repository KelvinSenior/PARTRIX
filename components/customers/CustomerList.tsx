"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CustomerDTO } from "@/types/customer";
import { Button, DataTable, EmptyState, Modal, Pagination, toastError, toastSuccess } from "@/components/ui";

interface CustomerListProps {
  customers: CustomerDTO[];
  total: number;
  currentPage: number;
  query?: string;
}

export default function CustomerList({ customers, total, currentPage, query }: CustomerListProps) {
  const router = useRouter();
  const [activeCustomer, setActiveCustomer] = useState<CustomerDTO | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pageCount = Math.max(1, Math.ceil(total / 12));
  const basePath = query ? `/customers?q=${encodeURIComponent(query)}` : "/customers";

  async function handleDelete() {
    if (!activeCustomer) return;
    setLoadingId(activeCustomer.id);
    try {
      const res = await fetch(`/api/customers/${activeCustomer.id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Could not delete customer.");
      }
      toastSuccess("Customer deleted successfully.");
      setActiveCustomer(null);
      router.refresh();
    } catch (error) {
      toastError((error as Error).message || "Could not delete customer.");
    } finally {
      setLoadingId(null);
    }
  }

  const columns = [
    {
      header: "Customer",
      cell: (customer: CustomerDTO) => (
        <div className="space-y-1">
          <div className="font-semibold text-zinc-950 dark:text-zinc-50">{customer.firstName} {customer.lastName}</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">{customer.company || "No company"}</div>
        </div>
      ),
      className: "min-w-[220px]",
    },
    {
      header: "Email",
      cell: (customer: CustomerDTO) => <span>{customer.email ?? "—"}</span>,
    },
    {
      header: "Phone",
      cell: (customer: CustomerDTO) => <span>{customer.phone ?? "—"}</span>,
    },
    {
      header: "Created",
      cell: (customer: CustomerDTO) => <span>{new Date(customer.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: "Actions",
      cell: (customer: CustomerDTO) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/customers/${customer.id}/edit`} className="rounded-2xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900">
            Edit
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setActiveCustomer(customer)}
            disabled={loadingId === customer.id}
          >
            {loadingId === customer.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Customers</p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Customer directory</h1>
          </div>
          <Link href="/customers/add">
            <Button>New customer</Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={customers}
          emptyState={
            <EmptyState
              title="No customers yet"
              description="Add some customers to build your rental pipeline."
              action={<Link href="/customers/add"><Button>Start adding customers</Button></Link>}
            />
          }
        />

        <Pagination currentPage={currentPage} totalPages={pageCount} basePath={basePath} />
      </div>

      <Modal
        open={Boolean(activeCustomer)}
        title="Confirm delete"
        description={activeCustomer ? `Delete ${activeCustomer.firstName} ${activeCustomer.lastName}? This cannot be undone.` : undefined}
        onClose={() => setActiveCustomer(null)}
        footer={
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setActiveCustomer(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={loadingId === activeCustomer?.id}>
              Delete customer
            </Button>
          </div>
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">This action permanently removes the customer record from RentFlow.</p>
      </Modal>
    </div>
  );
}
