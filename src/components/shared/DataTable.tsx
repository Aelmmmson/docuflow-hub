/**
 * DataTable Component
 * ===================
 * Responsive data table with mobile card view.
 */

import { ReactNode } from "react";
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
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  mobileCardRender?: (item: T, index: number) => ReactNode;
}

export function DataTable<T extends object>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = "No data available",
  mobileCardRender,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn("text-xs font-semibold", column.className)}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "text-sm",
                  onRowClick && "cursor-pointer hover:bg-muted/50"
                )}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn("py-3", column.className)}
                  >
                  {column.render
                      ? column.render(item, index)
                      : String((item as Record<string, unknown>)[column.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((item, index) =>
          mobileCardRender ? (
            <div key={keyExtractor(item)}>{mobileCardRender(item, index)}</div>
          ) : (
            <div
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "rounded-lg bg-card border border-border p-3 space-y-2",
                onRowClick && "cursor-pointer active:bg-muted/50"
              )}
            >
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((column) => (
                  <div
                    key={column.key}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground font-medium">
                      {column.header}
                    </span>
                    <span className="text-foreground">
                      {column.render
                        ? column.render(item, index)
                        : String((item as Record<string, unknown>)[column.key] ?? "")}
                    </span>
                  </div>
                ))}
            </div>
          )
        )}
      </div>
    </>
  );
}
