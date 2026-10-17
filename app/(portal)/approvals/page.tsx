"use client";

import { useMemo, useState } from "react";
import type { RequestView } from "@/lib/domain/types";
import { useApi } from "@/lib/client/hooks";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tx } from "@/lib/i18n/locale";
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
  const { m } = useI18n();
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
        <PageHeader title={m.approvals.title} />
        <AccessDenied message={error.message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={isHr ? m.approvals.allTitle : m.approvals.title}
        description={isHr ? m.approvals.hrHint : m.approvals.mgrHint}
      />

      <Tabs
        tabs={[
          { key: "action", label: tx(m.approvals.action, { n: open.length }) },
          { key: "decided", label: tx(m.approvals.decided, { n: decided.length }) },
          { key: "all", label: tx(m.approvals.all, { n: all.length }) },
        ]}
        onChange={(k) => setTab(k as Tab)}
      />

      {loading && !data && <LoadingBlock rows={3} />}
      {error && !data && <ErrorBlock message={error.message} onRetry={reload} />}

      {data && list.length === 0 && (
        <EmptyState
          icon={<CheckCircleIcon size={20} />}
          title={tab === "action" ? m.approvals.emptyIn : m.approvals.empty}
          description={tab === "action" ? m.approvals.emptyInHint : m.approvals.emptyHint}
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
