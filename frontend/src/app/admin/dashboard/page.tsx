"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
  Database,
  LogOut,
  Menu,
  X,
  Shield,
  Briefcase,
  Building2,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import DashboardView from "@/components/admin/DashboardView";
import UsersView from "@/components/admin/UsersView";
import PostulacionesView from "@/components/admin/PostulacionesView";
import RankingsView from "@/components/admin/RankingsView";
import RawDataView from "@/components/admin/RawDataView";
import CargosView from "@/components/admin/CargosView";
import EmpresasView from "@/components/admin/EmpresasView";

type TabType = "dashboard" | "usuarios" | "empresas" | "cargos" | "postulaciones" | "rankings" | "raw-data";

export default function AdminDashboardPage() {
  const { stats, rankings, postulacionesStats, topCargos, loading, error, logout, refresh } =
    useAdminDashboard();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "usuarios" as TabType, label: "Usuarios", icon: Users },
    { id: "empresas" as TabType, label: "Empresas", icon: Building2 },
    { id: "cargos" as TabType, label: "Cargos", icon: Briefcase },
    { id: "postulaciones" as TabType, label: "Postulaciones", icon: FileText },
    { id: "rankings" as TabType, label: "Rankings", icon: TrendingUp },
    { id: "raw-data" as TabType, label: "Data Cruda", icon: Database },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-center mb-4">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Error de acceso</h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <button
            onClick={logout}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header del sidebar */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-purple-400" />
              <span className="font-bold text-lg">Magnolias Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="font-medium">{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-gray-600 mt-1">
              Panel de administración del sistema APT
            </p>
          </div>

          {/* Content based on active tab */}
          {activeTab === "dashboard" && (
            <DashboardView
              stats={stats}
              rankings={rankings}
              postulacionesStats={postulacionesStats}
              topCargos={topCargos}
              refresh={refresh}
            />
          )}

          {activeTab === "usuarios" && <UsersView />}

          {activeTab === "empresas" && <EmpresasView />}

          {activeTab === "cargos" && <CargosView />}

          {activeTab === "postulaciones" && <PostulacionesView />}

          {activeTab === "rankings" && <RankingsView rankings={rankings} />}

          {activeTab === "raw-data" && <RawDataView />}
        </div>
      </main>
    </div>
  );
}
