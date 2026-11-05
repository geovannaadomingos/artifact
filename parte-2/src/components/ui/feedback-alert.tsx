import React from "react";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

export type FeedbackType = "success" | "error" | "info" | null;

interface FeedbackAlertProps {
  type: FeedbackType;
  message: string | null;
  onClose?: () => void;
}

export function FeedbackAlert({ type, message, onClose }: FeedbackAlertProps) {
  if (!type || !message) return null;

  const styles = {
    success: "bg-emerald-50 border-emerald-300 text-emerald-800",
    error: "bg-rose-50 border-rose-300 text-rose-800",
    info: "bg-sky-50 border-sky-300 text-sky-800",
  }[type];

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Loader2 className="w-5 h-5 text-sky-600 animate-spin shrink-0" />,
  }[type];

  return (
    <div
      role="alert"
      className={`flex items-center justify-between p-4 rounded-lg border shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${styles}`}
    >
      <div className="flex items-center gap-3">
        {icons}
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Fechar notificação"
          className="p-1 rounded-md hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      )}
    </div>
  );
}

