"use client";

import { useMemo, type ReactNode } from "react";
import { BarChart2, MapPin, MailCheck, Rocket } from "lucide-react";
import type { Business, EmailEvent, OutreachStats } from "../../lib/types";
import { LineChart } from "./LineChart";
import { DonutChart } from "./DonutChart";
import { Tooltip } from "./Tooltip";

interface DashboardOverviewProps {
  stats: OutreachStats;
  businesses: Business[];
  emailEvents: EmailEvent[];
}

const COLORS = {
  interested: "#3FB783",
  replies: "#3A80F6",
  opens: "#F8B84E",
  sent: "#5C6C7A",
};

export function DashboardOverview({
  stats,
  businesses,
  emailEvents,
}: DashboardOverviewProps) {
  const withoutWebsite = useMemo(
    () => businesses.filter((biz) => !biz.hasWebsite).length,
    [businesses],
  );

  const statusBreakdown = useMemo(() => {
    const counts = {
      interested: businesses.filter((biz) => biz.status === "interested").length,
      replied: businesses.filter((biz) => biz.status === "replied").length,
      opened: businesses.filter((biz) => biz.status === "opened").length,
      emailed: businesses.filter((biz) => biz.status === "email_sent").length,
    };
    return [
      {
        label: "Interested",
        value: counts.interested,
        color: COLORS.interested,
      },
      {
        label: "Replied",
        value: counts.replied,
        color: COLORS.replies,
      },
      {
        label: "Opened",
        value: counts.opened,
        color: COLORS.opens,
      },
      {
        label: "Email Sent",
        value: counts.emailed,
        color: COLORS.sent,
      },
    ];
  }, [businesses]);

  const engagementData = useMemo(() => {
    const grouped = emailEvents.reduce<Record<string, number>>((acc, event) => {
      const day = new Date(event.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(
        ([a], [b]) =>
          new Date(a).getTime() - new Date(b).getTime(),
      )
      .slice(-8)
      .map(([label, value]) => ({ label, value }));
  }, [emailEvents]);

  return (
    <section className="section">
      <header className="section__header">
        <div>
          <h1>Outreach control center</h1>
          <p className="section__subtitle">
            Monitor AI-powered prospecting across Google Maps and optimize
            personalized cold outreach.
          </p>
        </div>
        <Tooltip label="Performance metrics are refreshed in real-time as automated discovery and outreach run.">
          <span className="badge">Live</span>
        </Tooltip>
      </header>

      <div className="metrics-grid" role="list">
        <MetricCard
          icon={<MapPin aria-hidden="true" />}
          title="Businesses analyzed"
          value={stats.totalAnalyzed.toLocaleString()}
          tooltip="Total locations scanned through Google Maps discovery."
        />
        <MetricCard
          icon={<BarChart2 aria-hidden="true" />}
          title="No website detected"
          value={withoutWebsite.toLocaleString()}
          tooltip="Opportunities lacking a published website or domain."
        />
        <MetricCard
          icon={<MailCheck aria-hidden="true" />}
          title="Cold emails sent"
          value={stats.emailsSent.toLocaleString()}
          tooltip="Personalized emails triggered by the AI sequencing engine."
        />
        <MetricCard
          icon={<Rocket aria-hidden="true" />}
          title="Response rate"
          value={`${stats.responseRate}%`}
          tooltip="Opens, replies, and interest signals over total outreach."
        />
      </div>

      <div className="charts-grid">
        <LineChart
          title="Engagement trend"
          data={
            engagementData.length
              ? engagementData
              : [
                  { label: "Mon", value: 8 },
                  { label: "Tue", value: 13 },
                  { label: "Wed", value: 9 },
                  { label: "Thu", value: 14 },
                  { label: "Fri", value: 11 },
                ]
          }
        />
        <DonutChart
          title="Pipeline health"
          segments={statusBreakdown}
          total={statusBreakdown.reduce((sum, item) => sum + item.value, 0)}
        />
      </div>
    </section>
  );
}

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  tooltip: string;
}

function MetricCard({ icon, title, value, tooltip }: MetricCardProps) {
  return (
    <article className="metric-card" role="listitem">
      <div className="metric-card__icon">{icon}</div>
      <div>
        <div className="metric-card__title">
          <span>{title}</span>
          <Tooltip label={tooltip}>
            <span className="metric-card__hint" aria-hidden="true">
              ⓘ
            </span>
          </Tooltip>
        </div>
        <p className="metric-card__value">{value}</p>
      </div>
    </article>
  );
}
