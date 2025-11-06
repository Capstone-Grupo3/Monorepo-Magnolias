"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RegistroBrandingSection,
  RegistroHeader,
  PostulanteForm,
  EmpresaForm,
  RegistroFooter,
  UserTypeSelector
} from "@/components/registro";

export default function RegistroPage() {
  const router = useRouter();
  const [tipoUsuario, setTipoUsuario] = useState<"empresa" | "postulante">("postulante");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [empresaForm, setEmpresaForm] = useState({
    rut: "",
    nombre: "",
    correo: "",
    contrasena: "",
    descripcion: "",
    logoUrl: "",
  });

  const [postulanteForm, setPostulanteForm] = useState({
    rut: "",
    nombre: "",
    correo: "",
    contrasena: "",
    telefono: "",
    linkedinUrl: "",
    experienciaAnios: 0,
  });

  const handleSubmitEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!empresaForm.rut.trim()) {
      setError("El RUT de la empresa es requerido");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        rut: empresaForm.rut.trim(),
        nombre: empresaForm.nombre,
        correo: empresaForm.correo,
        contrasena: empresaForm.contrasena,
        ...(empresaForm.descripcion && { descripcion: empresaForm.descripcion }),
        ...(empresaForm.logoUrl && { logoUrl: empresaForm.logoUrl }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/empresas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar empresa");
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPostulante = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!postulanteForm.rut.trim()) {
      setError("El RUT es requerido");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        rut: postulanteForm.rut.trim(),
        nombre: postulanteForm.nombre,
        correo: postulanteForm.correo,
        contrasena: postulanteForm.contrasena,
        ...(postulanteForm.telefono && { telefono: postulanteForm.telefono }),
        ...(postulanteForm.linkedinUrl && { linkedinUrl: postulanteForm.linkedinUrl }),
        ...(postulanteForm.experienciaAnios > 0 && { experienciaAnios: postulanteForm.experienciaAnios }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/Postulantes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar postulante");
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <RegistroBrandingSection />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <RegistroHeader isMobile />
          <RegistroHeader />

          <UserTypeSelector 
            tipoUsuario={tipoUsuario}
            onTipoChange={setTipoUsuario}
          />

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-start gap-2">
              <span className="text-red-500 font-bold">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {tipoUsuario === "postulante" ? (
            <PostulanteForm
              formData={postulanteForm}
              showPassword={showPassword}
              loading={loading}
              onFormChange={setPostulanteForm}
              onShowPasswordToggle={() => setShowPassword(!showPassword)}
              onSubmit={handleSubmitPostulante}
            />
          ) : (
            <EmpresaForm
              formData={empresaForm}
              showPassword={showPassword}
              loading={loading}
              onFormChange={setEmpresaForm}
              onShowPasswordToggle={() => setShowPassword(!showPassword)}
              onSubmit={handleSubmitEmpresa}
            />
          )}

          <RegistroFooter />
        </div>
      </div>
    </div>
  );
}
