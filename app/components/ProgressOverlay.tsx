"use client";

import { Loader2 } from "lucide-react";

interface ProgressOverlayProps {
  visible: boolean;
  title: string;
  description?: string;
  progress?: number;
}

export function ProgressOverlay({
  visible,
  title,
  description,
  progress,
}: ProgressOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="overlay" role="status" aria-live="polite">
      <div className="overlay__content">
        <Loader2 className="overlay__spinner" aria-hidden="true" />
        <div>
          <p className="overlay__title">{title}</p>
          {description ? (
            <p className="overlay__description">{description}</p>
          ) : null}
        </div>
        {typeof progress === "number" ? (
          <div className="overlay__progress" aria-hidden="true">
            <div
              className="overlay__progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
