import { KashiyatraLoader } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Brand */}
        <h1 className="text-2xl font-bold text-foreground tracking-wider">
          KASHIYATRA <span className="text-amber-500">2027</span>
        </h1>
        
        {/* Loader */}
        <KashiyatraLoader size="lg" />
        
        {/* Text */}
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
