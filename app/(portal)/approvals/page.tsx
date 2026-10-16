"use client";

import { useMemo, useState } from "react";
import type { RequestView } from "@/lib/domain/types";
import { useApi } from "@/lib/client/hooks";
import { Tabs } from "../../components/ui/Tabs";
import { EmptyState } from "../../components/ui/EmptyState";
import { CheckCircleIcon } from "../../components/portal/icons";
import { AccessDenied, ErrorBlock, LoadingBlock, PageHeader } from "../../components/portal/Panel";
import { RequestActions } from "../../components/portal/RequestActions";
import { RequestCard } from "../../components/portal/RequestCard";
import { useUser } from "../../components/portal/UserContext";

type Tab = "action" | "decided" | "all";

export default function ApprovalsPage() {
  const user = useUser();
  const [tab, setTab] = useState<Tab>("action");
  const { data, error, loading, reload } = useApi<{ requests: RequestView[] }>("/api/approvals", { interval: 5000 });

  const all = useMemo(() => data?.requests ?? [], [data]);
  const open = all.filter((r) => r.status === "submitted" || r.status === "in_review");
  const decided = all.filter((r) => !(r.status === "submitted" || r.status === "in_review"));
  const list = tab === "action" ? open : tab === "decided" ? decided : all;

  const isHr = user.role === "hr";

  if (error?.status === 403) {
    return (
      <>
        <PageHeader title="Approvals" />
        <AccessDenied message={error.message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isHr ? "All requests" : "Approvals"}
        description={
          isHr
            ? "Company-wide view. Decide any request except your own."
            : "Requests from your direct reports only. Nobody outside your team appears here."
        }
      />

      <Tabs
        tabs={[
          { key: "action", label: `Needs action · ${open.length}` },
          { key: "decided", label: `Decided · ${decided.length}` },
          { key: "all", label: `All · ${all.length}` },
        ]}
        onChange={(k) => setTab(k as Tab)}
      />

      {loading && !data && <LoadingBlock rows={3} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}

      {data && list.length === 0 && (
        <EmptyState
          icon={<CheckCircleIcon size={20} />}
          title={tab === "action" ? "Inbox zero" : "Nothing here"}
          description={tab === "action" ? "No requests are waiting for your decision." : "No requests in this view."}
        />
      )}

      <div className="flex flex-col gap-3">
        {list.map((r) => (
          <RequestCard
            key={r.id}
            request={r}
            showEmployee
            footer={r.allowedActions.length > 0 ? <RequestActions request={r} onDone={reload} compact /> : undefined}
          />
        ))}
      </div>
    </>
  );
}
