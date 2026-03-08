export default function Footer() {
    return (
        <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-8 mt-12 bg-white dark:bg-zinc-900">
            <div className="max-w-screen-2xl mx-auto px-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Club Sphear. All rights reserved.</p>
            </div>
        </footer>
    );
}
