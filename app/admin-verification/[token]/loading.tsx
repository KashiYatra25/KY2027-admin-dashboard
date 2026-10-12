import { KashiyatraLoader } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Brand */}
        <h1 className="text-2xl font-bold text-white tracking-wider">
          KASHIYATRA <span className="text-amber-500">2027</span>
        </h1>
        
        {/* Loader */}
        <KashiyatraLoader size="lg" />
        
        {/* Text */}
        <p className="text-slate-400 text-sm">Loading verification...</p>
      </div>
    </div>
  );
}
