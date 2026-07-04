export function LoadingSpinner({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="min-h-screen surface-page flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-secondary">{message}</p>
      </div>
    </div>
  );
}