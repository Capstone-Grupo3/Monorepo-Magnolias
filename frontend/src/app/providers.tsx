"use client";

import { ToastProvider } from "@/components/shared";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
