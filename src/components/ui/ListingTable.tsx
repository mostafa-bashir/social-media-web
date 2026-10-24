"use client";

import { Table, type TableProps } from "antd";

import ListingEmptyState from "./ListingEmptyState";

export interface ListingTableProps<T> extends TableProps<T> {
  /** Shown when there are no rows and no filters are active. */
  emptyTitle: string;
  emptyDescription?: string;
  /** Shown instead when filters/search are active. */
  emptyFilteredTitle?: string;
  filtered?: boolean;
}

/** antd Table with the shared listing skin and empty state. */
export default function ListingTable<T extends object>({
  emptyTitle,
  emptyDescription,
  emptyFilteredTitle,
  filtered = false,
  className,
  ...tableProps
}: ListingTableProps<T>) {
  return (
    <Table<T>
      {...tableProps}
      className={`listing-table ${className ?? ""}`.trim()}
      locale={{
        // Nothing while the first page loads, so the empty state never flashes.
        emptyText: tableProps.loading ? (
          <div className="h-40" />
        ) : filtered && emptyFilteredTitle ? (
          <ListingEmptyState compact title={emptyFilteredTitle} />
        ) : (
          <ListingEmptyState
            title={emptyTitle}
            description={emptyDescription}
          />
        ),
      }}
    />
  );
}
