"use client";

import { AlertTriangle, X } from "lucide-react";
import type { Dispatch } from "react";
import type { AppAction } from "../../lib/types";

interface ErrorBannerProps {
  message: string | null;
  dispatch: Dispatch<AppAction>;
}

export function ErrorBanner({ message, dispatch }: ErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-banner" role="alert">
      <AlertTriangle aria-hidden="true" />
      <div>
        <p className="error-banner__title">We ran into an issue</p>
        <p className="error-banner__message">{message}</p>
      </div>
      <button
        type="button"
        className="icon-button"
        onClick={() => dispatch({ type: "setError", message: null })}
        aria-label="Dismiss error message"
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
