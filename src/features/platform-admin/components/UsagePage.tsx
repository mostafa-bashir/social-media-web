"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, App, Button } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ListingShell from "@/components/ui/ListingShell";
import ListingTable from "@/components/ui/ListingTable";
import ListingToolbar from "@/components/ui/ListingToolbar";
import PageHeader from "@/components/ui/PageHeader";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useErrorMessage } from "@/hooks/use-error-message";

import { downloadUsageCsv, useTenantUsage } from "../api/usage";
import { useUsageColumns } from "../hooks/use-usage-columns";
import type { TenantUsageRow } from "../types/usage";
import UsageFilters, { type UsageFilterValues } from "./UsageFilters";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

/** Per-workspace usage for the chosen range, sortable and exportable. */
export default function UsagePage() {
  const t = useTranslations("admin.usage.table");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const columns = useUsageColumns();
  const [filterValues, setFilterValues] = useState<UsageFilterValues>({
    search: "",
    days: 30,
    sort: "postsPublished",
  });
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const search = useDebouncedValue(
    filterValues.search.trim(),
    SEARCH_DEBOUNCE_MS,
  );
  const filters = { days: filterValues.days, sort: filterValues.sort, search };
  const usage = useTenantUsage({ ...filters, page, pageSize: PAGE_SIZE });

  const exportCsv = () => {
    setExporting(true);
    downloadUsageCsv(filters)
      .catch((error: unknown) => message.error(errorMessage(error)))
      .finally(() => setExporting(false));
  };

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ListingShell
        fillPage={false}
        toolbar={
          <ListingToolbar
            filters={
              <UsageFilters
                value={filterValues}
                onChange={(next) => {
                  setFilterValues(next);
                  setPage(1);
                }}
              />
            }
            actions={
              <Button
                icon={<DownloadOutlined />}
                className="rounded-full!"
                loading={exporting}
                onClick={exportCsv}
              >
                {t("export")}
              </Button>
            }
          />
        }
      >
        {usage.error ? (
          <Alert
            type="error"
            showIcon
            title={errorMessage(usage.error)}
            className="m-4!"
          />
        ) : (
          <ListingTable<TenantUsageRow>
            rowKey="tenantId"
            columns={columns}
            dataSource={usage.data?.data ?? []}
            loading={usage.isFetching}
            filtered={Boolean(search)}
            emptyTitle={t("empty")}
            emptyFilteredTitle={t("emptyFiltered")}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: usage.data?.meta.total ?? 0,
              showSizeChanger: false,
              hideOnSinglePage: true,
              onChange: setPage,
            }}
          />
        )}
      </ListingShell>
    </>
  );
}
