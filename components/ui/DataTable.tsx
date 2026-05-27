import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyState?: ReactNode;
  className?: string;
}

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export default function DataTable<T>({ columns, data, emptyState, className }: DataTableProps<T>) {
  if (data.length === 0) {
    return <>{emptyState ?? null}</>;
  }

  return (
    <div className={mergeClasses("overflow-x-auto rounded-2xl border border-cyan-200/10 bg-white/[0.04] backdrop-blur-xl sm:rounded-3xl", className)}>
      <table className="min-w-full border-collapse text-left text-sm text-zinc-300">
        <thead className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-zinc-500">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className={mergeClasses("px-4 py-4 text-left align-middle", column.headerClassName)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.03]">
              {columns.map((column, index) => (
                <td key={index} className={mergeClasses("px-4 py-4 align-middle", column.className)}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
