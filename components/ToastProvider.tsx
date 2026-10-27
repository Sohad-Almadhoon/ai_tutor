"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error";
type ToastItem = { id: number; kind: ToastKind; message: string };
type ToastContextValue = {
  showToast: (kind: ToastKind, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context.showToast;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { id, kind, message }]);
      timers.current.set(id, setTimeout(() => dismissToast(id), 4000));
    },
    [dismissToast]
  );

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.kind === "success";
          const Icon = isSuccess ? CheckCircle2 : AlertCircle;
          return (
            <div
              key={toast.id}
              role={isSuccess ? "status" : "alert"}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl shadow-slate-950/10 ${
                isSuccess
                  ? "border-emerald-200"
                  : "border-red-200"
              }`}
            >
              <Icon
                className={`mt-0.5 size-5 shrink-0 ${
                  isSuccess ? "text-emerald-600" : "text-red-600"
                }`}
                aria-hidden="true"
              />
              <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-slate-800">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
