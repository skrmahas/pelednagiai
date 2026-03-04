export default function Loading() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-primary">RUNGTYNĖS</h1>
      <div className="bg-card-bg rounded-lg border border-border p-12">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
