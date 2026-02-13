import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_15%,#1d4ed8_0%,#4c1d95_32%,#060812_68%,#02030a_100%)] px-6 py-24 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-12 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 animate-fade-rise">
        <p className="inline-flex w-fit rounded-full border border-nebula-cyan/70 bg-nebula-cyan/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-nebula-cyan">
          VOIDSPACE
        </p>

        <div className="space-y-5">
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Build Flows On A
            <span className="block bg-gradient-to-r from-nebula-cyan via-nebula-pink to-nebula-violet bg-[length:220%_220%] bg-clip-text text-transparent animate-aurora-shift">
              Visual Node Canvas
            </span>
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Production-ready in-browser canvas for connected workflows with
            n8n-style edges, typed nodes, and instant UI feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/voidspace"
            className="rounded-md border border-nebula-cyan bg-nebula-cyan/15 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-nebula-cyan shadow-neon-sm transition hover:bg-nebula-cyan/25 hover:shadow-neon-md"
          >
            Launch Canvas
          </Link>
          <span className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Route: /voidspace
          </span>
        </div>
      </div>
    </main>
  );
}
