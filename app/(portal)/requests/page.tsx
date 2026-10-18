"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { RequestStatus, RequestView } from "@/lib/domain/types";
import { useApi } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Tabs } from "../../components/ui/Tabs";
import { DocIcon, PlusIcon } from "../../components/portal/icons";
import { NewRequestModal } from "../../components/portal/NewRequestModal";
import { ErrorBlock, LoadingBlock, PageHeader } from "../../components/portal/Panel";
import { RequestCard } from "../../components/portal/RequestCard";

type Filter = "all" | "open" | "approved" | "rejected";

const matchers: Record<Filter, (s: RequestStatus) => boolean> = {
  all: () => true,
  open: (s) => s === "draft" || s === "submitted" || s === "in_review",
  approved: (s) => s === "approved",
  rejected: (s) => s === "rejected" || s === "cancelled",
};

function RequestsInner() {
  const router = useRouter();
  const { m } = useI18n();
  const params = useSearchParams();
  const newParam = params.get("new");
  const [manualOpen, setManualOpen] = useState(false);
  const open = manualOpen || newParam !== null;
  const initialType = newParam === "advance" || newParam === "salary_advance" ? "salary_advance" : "vacation";

  const [filter, setFilter] = useState<Filter>("all");
  const { data, error, loading, reload } = useApi<{ requests: RequestView[] }>("/api/requests", { interval: 5000 });

  const requests = useMemo(() => data?.requests ?? [], [data]);
  const counts = useMemo(
    () => ({
      all: requests.length,
      open: requests.filter((r) => matchers.open(r.status)).length,
      approved: requests.filter((r) => matchers.approved(r.status)).length,
      rejected: requests.filter((r) => matchers.rejected(r.status)).length,
    }),
    [requests],
  );
  const visible = requests.filter((r) => matchers[filter](r.status));

  function closeModal() {
    setManualOpen(false);
    if (newParam !== null) router.replace("/requests");
    reload();
  }

  return (
    <>
      <PageHeader
        title={m.requests.title}
        actions={
          <Button variant="primary" size="sm" onClick={() => setManualOpen(true)}>
            <PlusIcon size={14} /> {m.requests.new}
          </Button>
        }
      />

      <Tabs
        tabs={[
          { key: "all", label: tx(m.requests.all, { n: counts.all }) },
          { key: "open", label: tx(m.requests.open, { n: counts.open }) },
          { key: "approved", label: tx(m.requests.approved, { n: counts.approved }) },
          { key: "rejected", label: tx(m.requests.rejected, { n: counts.rejected }) },
        ]}
        onChange={(k) => setFilter(k as Filter)}
      />

      {loading && !data && <LoadingBlock rows={3} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}

      {data && visible.length === 0 && (
        <EmptyState
          icon={<DocIcon size={20} />}
          title={filter === "all" ? m.requests.empty : m.requests.none}
          description={filter === "all" ? m.requests.emptyHint : m.requests.noneHint}
          action={
            filter === "all" ? (
              <Button variant="primary" size="sm" onClick={() => setManualOpen(true)}>
                <PlusIcon size={14} /> {m.requests.new}
              </Button>
            ) : undefined
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {visible.map((r) => (
          <RequestCard key={r.id} request={r} />
        ))}
      </div>

      <NewRequestModal open={open} initialType={initialType} onClose={closeModal} />
    </>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<LoadingBlock rows={3} />}>
      <RequestsInner />
    </Suspense>
  );
}
