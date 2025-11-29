"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  TrendingUp,
  Database,
  Shield,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);

  const menuGroups = [
    {
      name: "MENU",
      menuItems: [
        { icon: <LayoutDashboard size={24} />, label: "Dashboard", id: "dashboard" },
        { icon: <Users size={24} />, label: "Usuarios", id: "usuarios" },
        { icon: <Building2 size={24} />, label: "Empresas", id: "empresas" },
        { icon: <Briefcase size={24} />, label: "Cargos", id: "cargos" },
        { icon: <FileText size={24} />, label: "Postulaciones", id: "postulaciones" },
        { icon: <TrendingUp size={24} />, label: "Rankings", id: "rankings" },
        { icon: <Database size={24} />, label: "Raw Data", id: "raw-data" },
      ],
    },
  ];

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/admin/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-2">
               <Shield className="w-8 h-8 text-brand-500" />
               <span className="text-xl font-bold text-gray-800 dark:text-white">Magnolias Admin</span>
            </div>
          ) : (
            <Shield className="w-8 h-8 text-brand-500" />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    group.name
                  ) : (
                    <MoreHorizontal />
                  )}
                </h2>
                <ul className="flex flex-col gap-4">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <li key={menuIndex}>
                      <button
                        onClick={() => setActiveTab(menuItem.id)}
                        className={`menu-item group w-full ${
                          activeTab === menuItem.id ? "menu-item-active" : "menu-item-inactive"
                        } ${
                            !isExpanded && !isHovered
                            ? "lg:justify-center"
                            : "lg:justify-start"
                        }`}
                      >
                        <span
                          className={`${
                            activeTab === menuItem.id
                              ? "menu-item-icon-active"
                              : "menu-item-icon-inactive"
                          }`}
                        >
                          {menuItem.icon}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <span className={`menu-item-text`}>{menuItem.label}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
