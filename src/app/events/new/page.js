import EventForm from "@/components/events/EventForm";

export default function NewEventPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black py-16 px-4">
            <div className="w-full max-w-3xl">
                <h1 className="text-3xl font-bold mb-8 text-center">Club Event Management</h1>
                <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12">Submit new events for approval by the administration.</p>
                <EventForm />
            </div>
        </div>
    );
}
