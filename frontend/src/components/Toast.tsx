import { useEffect, useState } from "react";

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
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      viewBox="0 0 32 32"
      fill="none"
    >
      <circle cx="16" cy="16" r="16" fill="#16a34a" />
      <path
        d="M9 16.5l5 5 9-10.5"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      viewBox="0 0 32 32"
      fill="none"
    >
      <circle cx="16" cy="16" r="16" fill="#ba1a1a" />
      <path
        d="M16 10v7"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="22" r="1.25" fill="#ffffff" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      viewBox="0 0 32 32"
      fill="none"
    >
      <circle cx="16" cy="16" r="16" fill="#0058bc" />
      <path
        d="M16 14v8"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="10" r="1.25" fill="#ffffff" />
    </svg>
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
    return `${base} ${animation} border-[#16a34a40] bg-surface-container-lowest text-on-surface`;
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
