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
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Visor de Datos en Crudo</h2>
        </div>
        <p className="text-purple-100">
          Consulta la estructura completa en formato JSON de cualquier entidad del sistema
        </p>
      </div>

      {/* Selectores */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selector de entidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Entidad
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value as EntityType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {ENTITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {ENTITY_OPTIONS.find((opt) => opt.value === selectedEntity)?.description}
            </p>
          </div>

          {/* Input de ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID de la Entidad
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingresa el ID (número)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleFetchData}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Presiona Enter para buscar rápidamente
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-800">Error al obtener datos</h4>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Resultado JSON */}
      {rawData && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">
                {ENTITY_OPTIONS.find((opt) => opt.value === selectedEntity)?.label} - ID:{" "}
                {entityId}
              </h3>
            </div>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Copiar JSON
            </button>
          </div>

          <div className="p-6">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!rawData && !error && !loading && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12">
          <div className="text-center">
            <FileJson className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecciona una entidad y busca por ID
            </h3>
            <p className="text-gray-500">
              Los datos se mostrarán en formato JSON con toda la estructura completa
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
