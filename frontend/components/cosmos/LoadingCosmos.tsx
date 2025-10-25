export function LoadingCosmos() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-purple-900/20 to-blue-900/20">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">🌌</div>
        <p className="text-gray-400">Loading Cosmos...</p>
        <p className="text-gray-500 text-sm mt-2">Initializing 3D visualization...</p>
      </div>
    </div>
  );
}
