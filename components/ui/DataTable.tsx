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
    <div className={mergeClasses("overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl sm:rounded-3xl dark:border-cyan-200/10 dark:bg-white/[0.04]", className)}>
      <table className="min-w-[640px] border-collapse text-left text-sm text-slate-700 dark:text-zinc-300">
        <thead className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 text-xs uppercase tracking-[0.2em] text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-[#050816]/95 dark:text-zinc-500">
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
            <tr key={rowIndex} className="border-b border-slate-200/70 last:border-b-0 hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/[0.03]">
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
