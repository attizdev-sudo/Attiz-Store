export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 text-brand-dark/45">
      <div className="w-8 h-8 rounded-full border-2 border-brand-brown border-t-transparent animate-spin" />
      <span className="font-sans text-xs font-bold tracking-widest uppercase">Loading...</span>
    </div>
  );
}
