/**
 * Componente de Paginación reutilizable
 * Muestra controles de navegación para listas paginadas
 */

"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationMeta } from "@/types";

interface PaginacionProps {
  /** Metadatos de paginación */
  meta: PaginationMeta;
  /** Callback al cambiar de página */
  onPageChange: (page: number) => void;
  /** Mostrar información de total de elementos */
  showInfo?: boolean;
  /** Cantidad de páginas visibles a cada lado de la actual */
  siblingCount?: number;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Genera el rango de páginas a mostrar
 */
function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | "ellipsis")[] {
  const totalPageNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 ellipsis

  // Si el total de páginas es menor que lo que queremos mostrar, mostramos todas
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  const pages: (number | "ellipsis")[] = [];

  // Siempre mostrar primera página
  pages.push(1);

  if (shouldShowLeftEllipsis) {
    pages.push("ellipsis");
  } else if (leftSiblingIndex > 1) {
    // Mostrar páginas entre 1 y leftSiblingIndex
    for (let i = 2; i < leftSiblingIndex; i++) {
      pages.push(i);
    }
  }

  // Páginas alrededor de la actual
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  if (shouldShowRightEllipsis) {
    pages.push("ellipsis");
  } else if (rightSiblingIndex < totalPages) {
    // Mostrar páginas entre rightSiblingIndex y última
    for (let i = rightSiblingIndex + 1; i < totalPages; i++) {
      pages.push(i);
    }
  }

  // Siempre mostrar última página si hay más de una
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export default function Paginacion({
  meta,
  onPageChange,
  showInfo = true,
  siblingCount = 1,
  className = "",
}: PaginacionProps) {
  const { page, totalPages, total, limit, hasNextPage, hasPrevPage } = meta;

  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    return showInfo ? (
      <div className={`flex justify-center items-center text-sm text-slate-600 ${className}`}>
        Mostrando {total} de {total} resultado{total !== 1 ? "s" : ""}
      </div>
    ) : null;
  }

  const pages = generatePageRange(page, totalPages, siblingCount);

  // Calcular rango de elementos mostrados
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Información de resultados */}
      {showInfo && (
        <div className="text-sm text-slate-600 order-2 sm:order-1">
          Mostrando <span className="font-medium text-slate-900">{startItem}</span> a{" "}
          <span className="font-medium text-slate-900">{endItem}</span> de{" "}
          <span className="font-medium text-slate-900">{total}</span> resultado
          {total !== 1 ? "s" : ""}
        </div>
      )}

      {/* Controles de paginación */}
      <nav
        className="flex items-center gap-1 order-1 sm:order-2"
        aria-label="Paginación"
      >
        {/* Botón primera página */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all"
          aria-label="Primera página"
          title="Primera página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Botón anterior */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all"
          aria-label="Página anterior"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1 mx-1">
          {pages.map((pageNum, index) =>
            pageNum === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-slate-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={pageNum === page}
                className={`min-w-9 h-9 px-3 rounded-lg font-medium transition-all ${
                  pageNum === page
                    ? "bg-orange-500 text-white shadow-md cursor-default"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
                aria-label={`Página ${pageNum}`}
                aria-current={pageNum === page ? "page" : undefined}
              >
                {pageNum}
              </button>
            )
          )}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all"
          aria-label="Página siguiente"
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Botón última página */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all"
          aria-label="Última página"
          title="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
