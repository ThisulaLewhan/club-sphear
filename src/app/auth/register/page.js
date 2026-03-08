/**
 * Register Page
 * Owner: Lisura (Authentication & Student Profile Module)
 */

import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Account | Club Sphear",
  description: "Register as a student on Club Sphear",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <RegisterForm />
    </div>
  );
}
