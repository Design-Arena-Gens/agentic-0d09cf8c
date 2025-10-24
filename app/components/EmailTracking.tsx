"use client";

import { useMemo, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Clock4,
  Inbox,
  Reply,
  SendHorizontal,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";
import { useAppState } from "../../context/AppStateContext";
import type { Business, EmailEvent } from "../../lib/types";
import { StatusBadge } from "./StatusBadge";
import { Tooltip } from "./Tooltip";

const STATUS_PRIORITY = [
  "not_contacted",
  "email_sent",
  "opened",
  "replied",
  "interested",
  "not_interested",
] as const;

export function EmailTracking() {
  const { state, dispatch, generateEmailEvent } = useAppState();

  const headsUp = useMemo(() => {
    const pending = state.businesses.filter(
      (biz) => biz.status === "email_sent",
    ).length;
    const interested = state.businesses.filter(
      (biz) => biz.status === "interested",
    ).length;
    return { pending, interested };
  }, [state.businesses]);

  const businessesSorted = useMemo(() => {
    const priorityMap = Object.fromEntries(
      STATUS_PRIORITY.map((status, index) => [status, index]),
    );
    return [...state.businesses].sort((a, b) => {
      const rankA = priorityMap[a.status] ?? 0;
      const rankB = priorityMap[b.status] ?? 0;
      return rankA - rankB;
    });
  }, [state.businesses]);

  const eventsByBusiness = useMemo(() => {
    return state.emailEvents.reduce<Record<string, EmailEvent[]>>(
      (acc, event) => {
        if (!acc[event.businessId]) {
          acc[event.businessId] = [];
        }
        acc[event.businessId].push(event);
        return acc;
      },
      {},
    );
  }, [state.emailEvents]);

  const scoreboard = useMemo(() => {
    const counts = {
      sent: state.emailEvents.filter((event) => event.type === "sent").length,
      opened: state.emailEvents.filter((event) => event.type === "opened").length,
      reply: state.emailEvents.filter((event) => event.type === "reply").length,
      clicked: state.emailEvents.filter((event) => event.type === "clicked").length,
    };
    const total = Math.max(counts.sent, 1);
    return {
      counts,
      openRate: Math.round((counts.opened / total) * 100),
      replyRate: Math.round((counts.reply / total) * 100),
    };
  }, [state.emailEvents]);

  const handleAdvanceStatus = (business: Business) => {
    const nextStatus = getNextStatus(business.status);
    dispatch({ type: "updateBusinessStatus", businessId: business.id, status: nextStatus });
    generateEmailEvent(business.id, nextStatus);
  };

  return (
    <section className="section">
      <header className="section__header">
        <div>
          <h2>Email delivery & engagement</h2>
          <p className="section__subtitle">
            Track deliveries, opens, clicks, and replies as campaigns execute.
          </p>
        </div>
        <div className="scoreboard">
          <div>
            <span>Open rate</span>
            <strong>{scoreboard.openRate}%</strong>
          </div>
          <div>
            <span>Reply rate</span>
            <strong>{scoreboard.replyRate}%</strong>
          </div>
        </div>
      </header>

      <div className="tracking-grid">
        <article className="tracking-card">
          <header>
            <SendHorizontal aria-hidden="true" />
            <div>
              <h3>Sending queue</h3>
              <p>{headsUp.pending} queued • {headsUp.interested} interested</p>
            </div>
          </header>
          <div className="progress">
            <span>Automation progress</span>
            <div className="progress__bar" aria-hidden="true">
              <div
                className="progress__indicator"
                style={{ width: `${state.sendProgress}%` }}
              />
            </div>
            <span className="progress__value">{state.sendProgress}%</span>
          </div>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => dispatch({ type: "setSending", value: !state.isSendingEmails })}
          >
            {state.isSendingEmails ? "Pause sequencing" : "Resume sequencing"}
          </button>
        </article>

        <article className="events-card">
          <header>
            <Inbox aria-hidden="true" />
            <h3>Engagement feed</h3>
          </header>
          <ul className="events-card__list">
            {state.emailEvents
              .slice()
              .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
              .slice(0, 6)
              .map((event) => {
                const business = state.businesses.find(
                  (biz) => biz.id === event.businessId,
                );
                if (!business) return null;
                return (
                  <li key={event.id}>
                    <div>
                      <strong>{business.name}</strong>
                      <span>{formatEventLabel(event.type)}</span>
                    </div>
                    <time>
                      <Clock4 aria-hidden="true" /> {formatDate(event.timestamp)}
                    </time>
                  </li>
                );
              })}
          </ul>
        </article>
      </div>

      <div className="tracking-table" role="table">
        <div className="tracking-table__header" role="row">
          <span role="columnheader">Business</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Engagement</span>
          <span role="columnheader">Action</span>
        </div>
        {businessesSorted.map((biz) => (
          <div key={biz.id} className="tracking-table__row" role="row">
            <div role="cell">
              <strong>{biz.name}</strong>
              <p>{biz.category}</p>
            </div>
            <div role="cell">
              <StatusBadge status={biz.status} />
              <p className="tracking-table__meta">
                {biz.lastInteraction
                  ? `Updated ${formatRelativeDate(biz.lastInteraction)}`
                  : "Awaiting outreach"}
              </p>
            </div>
            <div role="cell">
              <EngagementBadges events={eventsByBusiness[biz.id] ?? []} />
            </div>
            <div role="cell">
              <button
                type="button"
                className="button button--icon"
                onClick={() => handleAdvanceStatus(biz)}
              >
                Advance <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EngagementBadges({ events }: { events: EmailEvent[] }) {
  const grouped = events.reduce(
    (acc, event) => ({
      ...acc,
      [event.type]: (acc[event.type] ?? 0) + 1,
    }),
    {} as Record<EmailEvent["type"], number>,
  );

  return (
    <div className="engagement-badges">
      <Badge icon={<SendHorizontal aria-hidden="true" />} active={!!grouped.sent}>
        {grouped.sent ?? 0}
      </Badge>
      <Badge icon={<Activity aria-hidden="true" />} active={!!grouped.opened}>
        {grouped.opened ?? 0}
      </Badge>
      <Badge icon={<TrendingUp aria-hidden="true" />} active={!!grouped.clicked}>
        {grouped.clicked ?? 0}
      </Badge>
      <Badge icon={<Reply aria-hidden="true" />} active={!!grouped.reply}>
        {grouped.reply ?? 0}
      </Badge>
    </div>
  );
}

function Badge({
  icon,
  active,
  children,
}: {
  icon: ReactNode;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx("badge badge--compact", {
        "badge--active": active,
      })}
    >
      {icon}
      {children}
    </span>
  );
}

function formatEventLabel(type: EmailEvent["type"]) {
  switch (type) {
    case "sent":
      return "Email sent";
    case "delivered":
      return "Delivered";
    case "opened":
      return "Opened";
    case "clicked":
      return "Clicked link";
    case "reply":
      return "Reply received";
    default:
      return type;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function getNextStatus(status: Business["status"]) {
  const order = STATUS_PRIORITY as readonly string[];
  const index = order.indexOf(status);
  const nextIndex = Math.min(order.length - 1, index + 1);
  return order[nextIndex] as Business["status"];
}
