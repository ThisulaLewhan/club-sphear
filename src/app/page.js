import EventCalendar from "@/components/events/EventCalendar";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full flex-col">
        <EventCalendar />
      </main>
    </div>
  );
}
