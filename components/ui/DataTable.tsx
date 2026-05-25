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
    <div className={mergeClasses("overflow-x-auto rounded-[32px] border border-zinc-200/80 bg-white/95 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85", className)}>
      <table className="min-w-full border-collapse text-left text-sm text-zinc-700 dark:text-zinc-300">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-[0.25em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
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
            <tr key={rowIndex} className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-900">
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
