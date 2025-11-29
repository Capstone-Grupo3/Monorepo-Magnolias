"use client";
import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";

interface DefaultLayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  logout: () => void;
}

const LayoutContent = ({
  children,
  activeTab,
  setActiveTab,
  logout,
}: DefaultLayoutProps) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-900 ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <Header logout={logout} />
        <main className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function DefaultLayout(props: DefaultLayoutProps) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <LayoutContent {...props} />
      </SidebarProvider>
    </ThemeProvider>
  );
}
