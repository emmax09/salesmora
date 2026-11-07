'use client';

import { useMemo, useState } from 'react';

export type DataColumn<Row> = {
  key: keyof Row;
  label: string;
  searchable?: boolean;
  render?: (row: Row) => React.ReactNode;
};

export function DataTable<Row extends Record<string, unknown>>({
  rows,
  columns,
  pageSize = 8,
}: {
  rows: Row[];
  columns: DataColumn<Row>[];
  pageSize?: number;
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: keyof Row; direction: 1 | -1 } | null>(null);
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        columns.some(
          (column) =>
            column.searchable !== false &&
            String(row[column.key] ?? '')
              .toLowerCase()
              .includes(query.toLowerCase()),
        ),
      ),
    [rows, columns, query],
  );
  const sorted = useMemo(
    () =>
      sort
        ? [...filtered].sort(
            (a, b) =>
              String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''), undefined, {
                numeric: true,
              }) * sort.direction,
          )
        : filtered,
    [filtered, sort],
  );
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visible = sorted.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <section aria-label="Data table" className="space-y-3">
      <label className="block max-w-sm text-sm font-medium text-primary">
        Search rows
        <input
          className="mt-2 min-h-11 w-full rounded-control border border-border-strong bg-surface px-3 text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus/30"
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          value={query}
        />
      </label>
      {visible.length ? (
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-surface-muted text-secondary">
              <tr>
                {columns.map((column) => (
                  <th
                    className="whitespace-nowrap px-4 py-3 font-semibold"
                    key={String(column.key)}
                    scope="col"
                  >
                    <button
                      className="rounded-sm text-left focus-visible:outline-2 focus-visible:outline-focus"
                      onClick={() =>
                        setSort((current) => ({
                          key: column.key,
                          direction:
                            current?.key === column.key ? (current.direction === 1 ? -1 : 1) : 1,
                        }))
                      }
                      type="button"
                    >
                      {column.label}
                      <span aria-hidden="true">
                        {sort?.key === column.key ? (sort.direction === 1 ? ' ↑' : ' ↓') : ''}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, index) => (
                <tr className="border-t border-border" key={index}>
                  {columns.map((column) => (
                    <td className="px-4 py-3 text-primary" key={String(column.key)}>
                      {column.render ? column.render(row) : String(row[column.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-border p-8 text-center text-sm text-secondary">
          No matching rows.
        </p>
      )}
      <div className="flex items-center justify-between text-sm text-secondary">
        <span>{filtered.length} rows</span>
        <div className="flex items-center gap-2">
          <button
            className="min-h-10 rounded-control border border-border px-3 disabled:opacity-50"
            disabled={page === 0}
            onClick={() => setPage((value) => value - 1)}
            type="button"
          >
            Previous
          </button>
          <span aria-live="polite">
            Page {page + 1} of {pages}
          </span>
          <button
            className="min-h-10 rounded-control border border-border px-3 disabled:opacity-50"
            disabled={page + 1 >= pages}
            onClick={() => setPage((value) => value + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
