import { toast } from "react-hot-toast";

export function toastSuccess(message: string) {
  toast.success(message, {
    style: { borderRadius: "1rem", background: "#0f172a", color: "#f8fafc" },
  });
}

export function toastError(message: string) {
  toast.error(message, {
    style: { borderRadius: "1rem", background: "#1f2937", color: "#f8fafc" },
  });
}
