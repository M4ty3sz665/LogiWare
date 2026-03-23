import React from 'react'

const navItems = ['Megoldás', 'Funkciók', 'Árazás', 'Támogatás', 'Blog']

const highlights = [
  'Készlet valós időben',
  'Rendelések egy nézetben',
  'Gyors, mobilbarát működés',
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a102c] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(70,118,255,0.35),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(57,200,255,0.2),transparent_45%),linear-gradient(180deg,#081030_0%,#152a8f_100%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-70">
        <span className="absolute left-[8%] top-[12%] h-1.5 w-1.5 rounded-full bg-white/70" />
        <span className="absolute left-[20%] top-[30%] h-1 w-1 rounded-full bg-white/60" />
        <span className="absolute left-[38%] top-[18%] h-1.5 w-1.5 rounded-full bg-white/70" />
        <span className="absolute left-[62%] top-[10%] h-1.5 w-1.5 rounded-full bg-white/60" />
        <span className="absolute left-[78%] top-[26%] h-1 w-1 rounded-full bg-white/70" />
        <span className="absolute left-[88%] top-[14%] h-1.5 w-1.5 rounded-full bg-white/70" />
        <span className="absolute left-[12%] top-[62%] h-1 w-1 rounded-full bg-white/60" />
        <span className="absolute left-[52%] top-[72%] h-1.5 w-1.5 rounded-full bg-white/60" />
        <span className="absolute left-[83%] top-[60%] h-1 w-1 rounded-full bg-white/60" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg">🍎</div>
            <span className="text-2xl font-extrabold tracking-tight">LogiWare</span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a key={item} href="#" className="text-base font-semibold text-white/90 transition hover:text-white">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="/register" className="hidden rounded-xl border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:inline-block">
              Regisztráció
            </a>
            <a href="/login" className="rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-[#0a102c] transition hover:bg-slate-100">
              Belépés
            </a>
          </div>
        </header>

        <main className="flex flex-1 items-center py-10 lg:py-14">
          <section className="max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
              Zöldség és gyümölcs platform
            </p>

            <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-6xl md:text-7xl">
              Friss áru
              <br />
              rendelés
              <br />
              profi módon
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-blue-100/95 sm:text-2xl">
              A LogiWare egy modern rendszer készletkezelésre, rendeléskövetésre és csapatmunkára.
              Minden rendelést gyorsan átlátsz, a kosár összegzésig.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="/register" className="inline-flex items-center justify-center rounded-2xl bg-[#62f0ff] px-7 py-3 text-base font-extrabold text-[#081030] shadow-[0_8px_25px_rgba(98,240,255,0.35)] transition hover:brightness-95">
                Kezdd el most
              </a>
              <a href="/login" className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-7 py-3 text-base font-bold text-white transition hover:bg-white/10">
                Már van fiókom
              </a>
            </div>

            <ul className="mt-7 space-y-2 text-sm font-semibold text-cyan-50/90 sm:text-base">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-cyan-200">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <section className="mb-6 rounded-[24px] border border-white/12 bg-[#050916]/80 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-cyan-300">Információk</h2>
              <div className="mt-4 space-y-2 text-base">
                <a href="#" className="block text-white/90 transition hover:text-cyan-300">Adatvédelmi tájékoztató</a>
                <a href="#" className="block text-white/90 transition hover:text-cyan-300">ÁSZF</a>
                <a href="#" className="block text-white/90 transition hover:text-cyan-300">Kapcsolat</a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-cyan-300">Elérhetőség</h2>
              <div className="mt-4 space-y-3 text-base text-white/90">
                <p><span className="text-white/55">Telefon:</span> +36 30 555 1122</p>
                <p><span className="text-white/55">E-mail:</span> info@logiware.hu</p>
                <p><span className="text-white/55">Cím:</span> Budapest, Egressy út 71, 1149</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-cyan-300">Lokáció</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                <iframe
                  title="LogiWare térkép"
                    src="https://www.google.com/maps?q=Budapest%2C%20Egressy%20%C3%BAt%2071%2C%201149&z=16&output=embed"
                  className="h-44 w-full"
                  loading="lazy"
                />
              </div>
              <a
                  href="https://www.google.com/maps/search/?api=1&query=Budapest%2C%20Egressy%20%C3%BAt%2071%2C%201149"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-lg border border-white/25 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Megnyitás térképen
              </a>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4 text-sm font-semibold text-white/55">
            © LOGIWARE Kft. 2025-2026 • Minden jog fenntartva.
          </div>
        </section>
      </div>
    </div>
  )
}
