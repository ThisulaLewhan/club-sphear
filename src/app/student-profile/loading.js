// loading skeleton for student profile

export default function StudentProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/5 border border-gray-100 overflow-hidden animate-pulse">
          {/* shiny header loader */}
          <div className="bg-gradient-to-r from-indigo-400 to-purple-400 px-8 py-10 flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-white/30 mb-4" />
            <div className="h-6 w-40 rounded-lg bg-white/30" />
          </div>
          {/* content blocks loader */}
          <div className="p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-gray-100" />
              ))}
            </div>
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-12 rounded-xl bg-gray-100" />
          </div>
        </div>
      </main>
    </div>
  );
}
