"use client";

import { useState } from "react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import DashboardView from "@/components/admin/DashboardView";
import UsersView from "@/components/admin/UsersView";
import PostulacionesView from "@/components/admin/PostulacionesView";
import RankingsView from "@/components/admin/RankingsView";
import RawDataView from "@/components/admin/RawDataView";
import CargosView from "@/components/admin/CargosView";
import EmpresasView from "@/components/admin/EmpresasView";
import DefaultLayout from "@/components/admin/layout/DefaultLayout";
import { Shield } from "lucide-react";

export default function AdminDashboardPage() {
  const { stats, rankings, postulacionesStats, topCargos, loading, error, logout, refresh } =
    useAdminDashboard();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-boxdark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos del sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-boxdark">
        <div className="bg-white dark:bg-boxdark-2 rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-center mb-4">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Error de acceso</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
          </div>
          <button
            onClick={logout}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <DefaultLayout activeTab={activeTab} setActiveTab={setActiveTab} logout={logout}>
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
    </DefaultLayout>
  );
}
