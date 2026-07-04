"use client";

import { useState } from "react";
import { Search, Database, FileJson, AlertCircle } from "lucide-react";
import { adminService } from "@/services/admin.service";

type EntityType = "usuario" | "empresa" | "cargo" | "postulacion";

interface EntityOption {
  value: EntityType;
  label: string;
  description: string;
}

const ENTITY_OPTIONS: EntityOption[] = [
  {
    value: "usuario",
    label: "Usuario (Postulante/Empresa)",
    description: "Ver datos completos de un usuario registrado",
  },
  {
    value: "empresa",
    label: "Empresa",
    description: "Ver datos completos de una empresa registrada",
  },
  {
    value: "cargo",
    label: "Cargo",
    description: "Ver datos completos de un cargo publicado",
  },
  {
    value: "postulacion",
    label: "Postulación",
    description: "Ver datos completos de una postulación con análisis IA",
  },
];

export default function RawDataView() {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>("usuario");
  const [entityId, setEntityId] = useState("");
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    if (!entityId.trim()) {
      setError("Debes ingresar un ID válido");
      return;
    }

    setLoading(true);
    setError(null);
    setRawData(null);

    try {
      const data = await adminService.getRawData(selectedEntity, parseInt(entityId));
      setRawData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo obtener los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFetchData();
    }
  };

  const copyToClipboard = () => {
    if (rawData) {
      navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
    }
  };

  return (
    <div className="space-y-6">
      <div className="primary-bg rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Visor de Datos en Crudo</h2>
        </div>
        <p className="text-white/80">
          Consulta la estructura completa en formato JSON de cualquier entidad del sistema
        </p>
      </div>

      <div className="surface-card rounded-xl border border-border-subtle p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Tipo de Entidad
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value as EntityType)}
              className="w-full px-4 py-2 border border-border-default rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary"
            >
              {ENTITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-muted">
              {ENTITY_OPTIONS.find((opt) => opt.value === selectedEntity)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              ID de la Entidad
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ingresa el ID (número)"
                className="flex-1 px-4 py-2 border border-border-default rounded-lg bg-transparent text-primary placeholder-muted focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleFetchData}
                disabled={loading}
                className="px-6 py-2 primary-bg text-white rounded-lg hover:primary-bg-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
            <p className="mt-1 text-sm text-muted">
              Presiona Enter para buscar rápidamente
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-soft border border-error/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-error">Error al obtener datos</h4>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {rawData && (
        <div className="surface-card rounded-xl border border-border-subtle overflow-hidden">
          <div className="px-6 py-4 surface-muted border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary dark:text-white">
                {ENTITY_OPTIONS.find((opt) => opt.value === selectedEntity)?.label} - ID:{" "}
                {entityId}
              </h3>
            </div>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 primary-bg text-white text-sm rounded-lg hover:primary-bg-hover transition-colors"
            >
              Copiar JSON
            </button>
          </div>

          <div className="p-6">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm font-mono">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {!rawData && !error && !loading && (
        <div className="surface-muted border-2 border-dashed border-border-default rounded-xl p-12">
          <div className="text-center">
            <FileJson className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary dark:text-white mb-2">
              Selecciona una entidad y busca por ID
            </h3>
            <p className="text-muted">
              Los datos se mostrarán en formato JSON con toda la estructura completa
            </p>
          </div>
        </div>
      )}
    </div>
  );
}