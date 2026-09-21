import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { XCircle } from "lucide-react";

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-card border border-border shadow-lg rounded-lg p-4 w-80 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex justify-between items-start">
            <div>
              {toast.title && (
                <p className="font-semibold text-foreground">{toast.title}</p>
              )}
              {toast.description && (
                <p className="text-muted-foreground text-sm mt-1">
                  {toast.description}
                </p>
              )}
              {toast.action && <div className="mt-3">{toast.action}</div>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
