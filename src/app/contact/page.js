// Feature Domain: Student Experience & Public Content

import ContactForm from "./ContactForm";

export const metadata = {
    title: "Contact Us",
    description: "Have a question or feedback? Get in touch with the Club Sphear team.",
};

export default function ContactUsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-zinc-900 pb-20">
            {/* Header Area */}
            <div className="w-full bg-zinc-50 border-b border-zinc-100 py-16 sm:py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-screen-xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
                        Contact Us
                    </h1>
                    <p className="text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto">
                        Have a question, feedback, or need support? Drop us a message below and our team will get back to you as soon as possible.
                    </p>
                </div>
            </div>

            <main className="max-w-screen-xl mx-auto px-6 py-16 -mt-10 relative z-20">
                <ContactForm />
            </main>
        </div>
    );
}
