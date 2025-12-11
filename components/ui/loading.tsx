"use client";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

