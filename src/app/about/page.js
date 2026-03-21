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

      {/* Mission */}
      <div className="grid md:grid-cols-2 gap-12 mb-20">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">Our Mission</h2>
          <p className="text-zinc-600 leading-relaxed mb-4">
            Club Sphear is a centralized platform built to streamline how university clubs and
            societies operate. We believe that student organizations are a cornerstone of the
            university experience — and they deserve modern tools to manage events, communicate
            with members, and grow their communities.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            Our goal is to replace scattered WhatsApp groups, email chains, and notice boards with
            a single, beautiful platform where everything lives in one place.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">What We Offer</h2>
          <ul className="space-y-3">
            {[
              "A centralized hub to discover and explore all campus clubs",
              "Event calendar with approval workflows for quality control",
              "Social feed for clubs to share posts and announcements",
              "Club dashboards for managing events, posts, and notices",
              "Admin panel for platform-wide oversight and management",
              "Secure authentication with email OTP verification",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-600">
                <span className="mt-1 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Team */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Built By Students, For Students</h2>
        <p className="text-zinc-500 max-w-xl mx-auto">
          Club Sphear was designed and developed as a university project, with
          the vision of making campus life more connected and organized.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
        {[
          { label: "Clubs Supported", value: "14+" },
          { label: "User Roles", value: "4" },
          { label: "Features", value: "20+" },
          { label: "API Endpoints", value: "15+" },
        ].map((stat, i) => (
          <div key={i} className="text-center p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
            <div className="text-3xl font-extrabold text-indigo-600 mb-1">{stat.value}</div>
            <div className="text-sm text-zinc-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
