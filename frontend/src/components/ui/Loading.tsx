export function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="spinner mb-4"></div>
      <p className="text-ue-text-secondary font-display uppercase tracking-wide">
        {message}
      </p>
    </div>
  );
}

export function LoadingSmall() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-4 border-ue-border border-t-ue-primary rounded-full animate-spin"></div>
    </div>
  );
}
