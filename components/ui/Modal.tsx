"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ open, title, description, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeydown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2> : null}
            {description ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p> : null}
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">{children}</div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
