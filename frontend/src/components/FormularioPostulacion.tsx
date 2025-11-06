"use client";

import { useState } from "react";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { CreatePostulacionDTO, PreguntaCargo } from "@/types";
import { validateCvFile } from "@/lib/validators";
import { CV_ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

interface FormularioPostulacionProps {
  cargoId: number;
  cargoTitulo: string;
  preguntas?: PreguntaCargo[];
  onSubmit: (data: CreatePostulacionDTO) => Promise<void>;
  onCancel: () => void;
}

export default function FormularioPostulacion({
  cargoId,
  cargoTitulo,
  preguntas = [],
  onSubmit,
  onCancel,
}: FormularioPostulacionProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo y tamaño
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Solo se permiten archivos PDF o Word");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo debe ser menor a 5MB");
        return;
      }
      setCvFile(file);
      setError("");
    }
  };

  const handleRespuestaChange = (index: number, value: string) => {
    setRespuestas({ ...respuestas, [index]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validar CV
      if (!cvFile) {
        throw new Error("Debes subir tu CV");
      }

      // Validar respuestas
      if (preguntas.length > 0) {
        const respuestasCompletas = preguntas.every((_, index) =>
          respuestas[index]?.trim()
        );
        if (!respuestasCompletas) {
          throw new Error("Debes responder todas las preguntas");
        }
      }

      // Construir datos de postulación
      const respuestasArray = preguntas.map((p, index) => ({
        pregunta: p.pregunta,
        respuesta: respuestas[index] || "",
      }));

      await onSubmit({
        cv_file: cvFile,
        respuestas_json: respuestasArray,
      });

      setSuccess(true);
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al enviar postulación"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Postulación Enviada!
        </h2>
        <p className="text-gray-600">
          Tu postulación ha sido recibida exitosamente. El equipo de
          reclutamiento la revisará pronto.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Postular a Cargo
          </h2>
          <p className="text-gray-600 mt-1">{cargoTitulo}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload CV */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currículum Vitae *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {!cvFile ? (
              <label className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  Haz clic para subir tu CV
                </p>
                <p className="text-xs text-gray-500">PDF o Word (máx. 5MB)</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="w-8 h-8 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">
                      {cvFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(cvFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCvFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preguntas Personalizadas */}
        {preguntas.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Preguntas del Empleador
            </h3>
            {preguntas.map((pregunta, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {index + 1}. {pregunta.pregunta} *
                </label>
                <textarea
                  rows={4}
                  value={respuestas[index] || ""}
                  onChange={(e) => handleRespuestaChange(index, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Escribe tu respuesta aquí..."
                  required
                />
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar Postulación"}
          </button>
        </div>
      </form>
    </div>
  );
}
