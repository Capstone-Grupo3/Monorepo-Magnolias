"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/shared";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
