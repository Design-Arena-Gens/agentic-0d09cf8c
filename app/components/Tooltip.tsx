"use client";

import { useId } from "react";

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  const id = useId();

  return (
    <span className="tooltip" aria-describedby={id}>
      {children}
      <span role="tooltip" id={id} className="tooltip__bubble">
        {label}
      </span>
    </span>
  );
}
