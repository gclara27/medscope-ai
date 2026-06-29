import { useEffect, useState } from "react";
import { AlertCircle, Check, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}

function SuccessIcon() {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-risk-low text-on-primary"
    >
      <Check className="h-4 w-4" strokeWidth={3} />
    </span>
  );
}

function ErrorIcon() {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error text-on-primary"
    >
      <AlertCircle className="h-4 w-4" strokeWidth={2.5} />
    </span>
  );
}

function InfoIcon() {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"
    >
      <Info className="h-4 w-4" strokeWidth={2.5} />
    </span>
  );
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return <SuccessIcon />;
  }
  if (variant === "error") {
    return <ErrorIcon />;
  }
  return <InfoIcon />;
}

function toastContainerClass(variant: ToastVariant, leaving: boolean): string {
  const animation = leaving ? "animate-toast-out" : "animate-toast-in";
  const base =
    "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border px-4 py-3 shadow-level-2 backdrop-blur-sm";

  if (variant === "success") {
    return `${base} ${animation} border-risk-low/25 bg-surface-container-lowest text-on-surface`;
  }
  if (variant === "error") {
    return `${base} ${animation} border-error/30 bg-error-container/40 text-on-error-container`;
  }
  return `${base} ${animation} border-outline-variant bg-surface-container-low text-on-surface`;
}

export function Toast({
  open,
  message,
  variant = "info",
  duration = 4000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(open);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setLeaving(false);
    }
  }, [open, message]);

  useEffect(() => {
    if (!open || !visible) {
      return;
    }

    const dismissTimer = window.setTimeout(() => {
      setLeaving(true);
    }, duration);

    return () => window.clearTimeout(dismissTimer);
  }, [open, visible, duration]);

  useEffect(() => {
    if (!leaving) {
      return;
    }

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      onClose();
    }, 200);

    return () => window.clearTimeout(hideTimer);
  }, [leaving, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <div className={toastContainerClass(variant, leaving)}>
        <ToastIcon variant={variant} />
        <p className="flex-1 text-sm leading-5 text-on-surface">{message}</p>
        <button
          type="button"
          onClick={() => setLeaving(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
          aria-label="Dismiss notification"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
