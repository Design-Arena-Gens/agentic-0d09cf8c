"use client";

import clsx from "clsx";
import type { BusinessStatus } from "../../lib/types";

const STATUS_MAP: Record<BusinessStatus, { label: string; className: string }> = {
  not_contacted: {
    label: "Not Contacted",
    className: "status-pill status-pill--muted",
  },
  email_sent: {
    label: "Email Sent",
    className: "status-pill status-pill--info",
  },
  opened: {
    label: "Opened",
    className: "status-pill status-pill--accent",
  },
  replied: {
    label: "Replied",
    className: "status-pill status-pill--success",
  },
  interested: {
    label: "Interested",
    className: "status-pill status-pill--success",
  },
  not_interested: {
    label: "Not Interested",
    className: "status-pill status-pill--danger",
  },
};

export function StatusBadge({ status }: { status: BusinessStatus }) {
  const statusConfig = STATUS_MAP[status];

  return (
    <span
      className={clsx("status-pill", statusConfig.className)}
      aria-label={`Status: ${statusConfig.label}`}
    >
      {statusConfig.label}
    </span>
  );
}
