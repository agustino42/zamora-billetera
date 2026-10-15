"use client";

import * as React from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  primary?: boolean;
  hideOnMobile?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  searchable = false,
  searchKeys,
  emptyMessage = "Sin datos",
  actions,
}: {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
  actions?: React.ReactNode;
}) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: string; dir: 1 | -1 } | null>(
    null,
  );

  const filtered = React.useMemo(() => {
    let rows = data;
    if (query && searchKeys) {
      const q = query.toLowerCase();
      rows = rows.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        rows = [...rows].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av < bv) return -1 * sort.dir;
          if (av > bv) return 1 * sort.dir;
          return 0;
        });
      }
    }
    return rows;
  }, [data, query, searchKeys, sort, columns]);

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const secondary = columns.filter((c) => c !== primary);

  return (
    <div className="rounded-2xl border border-border bg-card">
      {(searchable || actions) && (
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
            />
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.sortValue ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() =>
                        setSort((s) =>
                          s?.key === col.key
                            ? { key: col.key, dir: (s.dir * -1) as 1 | -1 }
                            : { key: col.key, dir: 1 },
                        )
                      }
                    >
                      {col.header}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-border md:hidden">
        {filtered.map((row) => (
          <div key={row.id} className="p-4">
            <div className="font-medium">{primary.render(row)}</div>
            <div className="mt-2 space-y-1">
              {secondary
                .filter((c) => !c.hideOnMobile)
                .map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-muted-foreground">{col.header}</span>
                    <span className="text-right">{col.render(row)}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className={cn("p-8 text-center text-sm text-muted-foreground")}>
          {emptyMessage}
        </p>
      )}
    </div>
  );
}
