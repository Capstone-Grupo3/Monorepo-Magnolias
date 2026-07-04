"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationMeta } from "@/types";

interface PaginacionProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  siblingCount?: number;
  className?: string;
}

function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | "ellipsis")[] {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  const pages: (number | "ellipsis")[] = [];

  pages.push(1);

  if (shouldShowLeftEllipsis) {
    pages.push("ellipsis");
  } else if (leftSiblingIndex > 1) {
    for (let i = 2; i < leftSiblingIndex; i++) {
      pages.push(i);
    }
  }

  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  if (shouldShowRightEllipsis) {
    pages.push("ellipsis");
  } else if (rightSiblingIndex < totalPages) {
    for (let i = rightSiblingIndex + 1; i < totalPages; i++) {
      pages.push(i);
    }
  }

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

  if (totalPages <= 1) {
    return showInfo ? (
      <div className={`flex justify-center items-center text-sm text-secondary ${className}`}>
        Mostrando {total} de {total} resultado{total !== 1 ? "s" : ""}
      </div>
    ) : null;
  }

  const pages = generatePageRange(page, totalPages, siblingCount);

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const btnClass = "p-2 rounded-lg border border-border-default text-secondary hover:bg-surface-hover hover:border-border-default disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border-default transition-all";
  const pageActiveClass = "primary-bg text-white shadow-md cursor-default";
  const pageInactiveClass = "border border-border-default text-secondary hover:bg-surface-hover hover:border-border-default";

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {showInfo && (
        <div className="text-sm text-secondary order-2 sm:order-1">
          Mostrando <span className="font-semibold text-primary">{startItem}</span> a{" "}
          <span className="font-semibold text-primary">{endItem}</span> de{" "}
          <span className="font-semibold text-primary">{total}</span> resultado
          {total !== 1 ? "s" : ""}
        </div>
      )}

      <nav
        className="flex items-center gap-1 order-1 sm:order-2"
        aria-label="Paginación"
      >
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className={btnClass}
          aria-label="Primera página"
          title="Primera página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className={btnClass}
          aria-label="Página anterior"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 mx-1">
          {pages.map((pageNum, index) =>
            pageNum === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-muted select-none"
              >
                …
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={pageNum === page}
                className={`min-w-9 h-9 px-3 rounded-lg font-medium transition-all ${
                  pageNum === page ? pageActiveClass : pageInactiveClass
                }`}
                aria-label={`Página ${pageNum}`}
                aria-current={pageNum === page ? "page" : undefined}
              >
                {pageNum}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className={btnClass}
          aria-label="Página siguiente"
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className={btnClass}
          aria-label="Última página"
          title="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}