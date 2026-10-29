"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => Promise<boolean | void>;
};

export default function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, setIsPending] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      const confirmed = await onConfirm();
      if (confirmed !== false) onClose();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        if (!isPending) onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !isPending) onClose();
      }}
      className="fixed left-1/2 top-1/2 m-0 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id={titleId}
              className="text-lg font-bold tracking-tight"
            >
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              {description}
            </p>
          </div>
        </div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:cursor-wait disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-wait disabled:opacity-70"
          >
            {isPending ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
