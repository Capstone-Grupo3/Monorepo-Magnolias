"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import DefaultLayout from "@/components/admin/layout/DefaultLayout";
import { Shield } from "lucide-react";

const DashboardView = dynamic(() => import("@/components/admin/DashboardView"), { ssr: false });
const UsersView = dynamic(() => import("@/components/admin/UsersView"), { ssr: false });
const PostulacionesView = dynamic(() => import("@/components/admin/PostulacionesView"), { ssr: false });
const RankingsView = dynamic(() => import("@/components/admin/RankingsView"), { ssr: false });
const RawDataView = dynamic(() => import("@/components/admin/RawDataView"), { ssr: false });
const CargosView = dynamic(() => import("@/components/admin/CargosView"), { ssr: false });
const EmpresasView = dynamic(() => import("@/components/admin/EmpresasView"), { ssr: false });

export default function AdminDashboardPage() {
  const { stats, rankings, postulacionesStats, topCargos, loading, error, logout, refresh } =
    useAdminDashboard();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen surface-page flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-secondary">Cargando datos del sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen surface-page flex items-center justify-center">
        <div className="surface-card rounded-lg shadow-lg p-8 max-w-md border border-border-subtle">
          <div className="text-error text-center mb-4">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-primary dark:text-white">Error de acceso</h2>
            <p className="text-secondary mt-2">{error}</p>
          </div>
          <button
            onClick={logout}
            className="w-full primary-bg text-white py-2 px-4 rounded-lg hover:primary-bg-hover transition-colors"
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
