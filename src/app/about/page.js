export const metadata = {
  title: "About Us | Club Sphear",
  description: "Learn about Club Sphear — the university club management system.",
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-screen-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
          About <span className="text-indigo-600">Club Sphear</span>
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
          Connecting students with the clubs and societies that shape their university experience.
        </p>
      </div>

      {/* Mission & Offerings in Cards */}
      <div className="grid lg:grid-cols-2 gap-8 mb-20">
        
        {/* Mission Card */}
        <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-lg shadow-zinc-200/50 border border-zinc-100 flex flex-col h-full relative overflow-hidden">
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
              Our Mission
            </h2>
            <p className="text-zinc-600 leading-relaxed mb-5 text-lg">
              Club Sphear is a centralized platform built to streamline how university clubs and
              societies operate. We believe that student organizations are a cornerstone of the
              university experience — and they deserve modern tools to manage events, communicate
              with members, and grow their communities.
            </p>
            <p className="text-zinc-600 leading-relaxed text-lg">
              Our goal is to replace scattered WhatsApp groups, email chains, and notice boards with
              a single, beautiful platform where everything lives in one place.
            </p>
          </div>
        </div>

        {/* Offerings Card */}
        <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-lg shadow-zinc-200/50 border border-zinc-100 flex flex-col h-full relative overflow-hidden">
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
              What We Offer
            </h2>
            <ul className="space-y-4">
              {[
                "A centralized hub to discover and explore all campus clubs",
                "Event calendar with approval workflows for quality control",
                "Social feed for clubs to share posts and announcements",
                "Club dashboards for managing events, posts, and notices",
                "Admin panel for platform-wide oversight and management",
                "Secure authentication with email OTP verification",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-zinc-600 text-lg">
                  <span className="mt-1.5 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
