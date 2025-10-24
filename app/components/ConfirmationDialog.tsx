"use client";

import { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import type { Business } from "../../lib/types";

interface ConfirmationDialogProps {
  open: boolean;
  businessId: string | null;
  businesses: Business[];
  onCancel: () => void;
  onConfirm: (businessId: string) => void;
}

export function ConfirmationDialog({
  open,
  businessId,
  businesses,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  const business = useMemo(
    () => businesses.find((biz) => biz.id === businessId) ?? null,
    [businesses, businessId],
  );

  if (!open || !business) {
    return null;
  }

  return (
    <div className="dialog" role="dialog" aria-modal="true">
      <div className="dialog__content">
        <div className="dialog__icon" aria-hidden="true">
          <AlertCircle />
        </div>
        <div className="dialog__body">
          <h3>Send cold email to {business.name}?</h3>
          <p>
            We'll personalize the message using the active template variant and
            track delivery, opens, and replies automatically.
          </p>
        </div>
        <div className="dialog__actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onConfirm(business.id)}
          >
            Send email
          </button>
        </div>
      </div>
    </div>
  );
}
