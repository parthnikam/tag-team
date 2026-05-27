import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="page-shell">
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-[#667085]">
          <Loader2 className="h-4 w-4 animate-spin text-[#0A0A0A]" />
          Loading meeting...
        </div>
      </div>
    </main>
  );
}
