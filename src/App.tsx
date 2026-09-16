import { useState, useEffect } from 'react'
import heroBg from './imports/JKT48-15.webp'

// ─── Types ───────────────────────────────────────────────────────────────────

type NavItem = 'Kalender' | 'Statistik' | 'Tiket' | 'Chant' 

interface Event {
  date: string
  day: string
  type: 'Teater' | '2-Shot' | 'Ulang Tahun' | 'Konser'
  title: string
  time: string
  location: string
}

interface Member {
  name: string
  team: string
  appearances: number
  lastShow: string
  favoriteSet: string
}

interface ChantEntry {
  song: string
  chant: string
  upvotes: number
  author: string
  verified: boolean
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const events: Event[] = [
  { date: '16', day: 'SEL', type: 'Teater', title: 'Setlist Koisuru Fortune Cookie', time: '18:30', location: 'Teater JKT48, FX Sudirman' },
  { date: '17', day: 'RAB', type: 'Teater', title: 'Setlist Pajama Drive', time: '13:00', location: 'Teater JKT48, FX Sudirman' },
  { date: '18', day: 'KAM', type: '2-Shot', title: '2-Shot Event — Team KIII', time: '10:00', location: 'JKT48 Cafe, Jakarta Selatan' },
  { date: '19', day: "JUM", type: 'Ulang Tahun', title: 'HBD Freya Jayawardana', time: 'Sepanjang Hari', location: '—' },
  { date: '20', day: 'SAB', type: 'Teater', title: 'Setlist Shonichi', time: '13:00', location: 'Teater JKT48, FX Sudirman' },
  { date: '20', day: 'SAB', type: 'Teater', title: 'Setlist Shonichi', time: '18:30', location: 'Teater JKT48, FX Sudirman' },
  { date: '21', day: 'MIN', type: 'Konser', title: 'JKT48 Fan Meeting 2026', time: '15:00', location: 'Balai Sarbini, Jakarta' },
  { date: '25', day: 'KAM', type: 'Teater', title: 'Setlist Beginner', time: '18:30', location: 'Teater JKT48, FX Sudirman' },
]

const members: Member[] = [
  { name: 'Freya Jayawardana', team: 'Team J', appearances: 24, lastShow: '14 Sep 2026', favoriteSet: 'Koisuru Fortune Cookie' },
  { name: 'Shani Indira Natio', team: 'Team KIII', appearances: 21, lastShow: '13 Sep 2026', favoriteSet: 'Pajama Drive' },
  { name: 'Christy Saura', team: 'Team T', appearances: 19, lastShow: '12 Sep 2026', favoriteSet: 'Shonichi' },
  { name: 'Muthe Muhadjirin', team: 'Team J', appearances: 18, lastShow: '14 Sep 2026', favoriteSet: 'Koisuru Fortune Cookie' },
  { name: 'Anindya Ardhana', team: 'Team T', appearances: 17, lastShow: '11 Sep 2026', favoriteSet: 'Beginner' },
]

const topSongs = [
  { title: 'Koisuru Fortune Cookie', count: 47, percent: 94 },
  { title: 'Oogoe Diamond', count: 39, percent: 78 },
  { title: 'Heavy Rotation', count: 35, percent: 70 },
  { title: 'Shonichi', count: 31, percent: 62 },
  { title: 'Pajama Drive', count: 28, percent: 56 },
]

const chants: ChantEntry[] = [
  {
    song: 'Tiger, Fire, Cyber',
    chant: 'Tiger! Fire! Cyber! Fiber!\nDagger! Jagger! Acceler!\n(Hai!) (Hai!) (Hai!)\nSpecial Human Being~',
    upvotes: 342,
    author: 'wota_senior_sby',
    verified: true,
  },
  {
    song: 'Koisuru Fortune Cookie',
    chant: 'Fortune Cookie ni Koishite~\n(Oshi no namae)!\nMirai wa mienai kedo~\n(Hai!) Fight-o!\nKono te wo nobashite~',
    upvotes: 287,
    author: 'fanlive_jakarta',
    verified: true,
  },
  {
    song: 'Heavy Rotation',
    chant: 'I want you~\n(Hai! Hai!)\nI need you~\n(Hai! Hai!)\nI love you~\n(Te wo agete!)\nDaisuki dayo~',
    upvotes: 215,
    author: 'wotagei_pro48',
    verified: false,
  },
]


const typeColor: Record<Event['type'], string> = {
  'Teater': 'text-white bg-[#E8001A]',
  '2-Shot': 'text-[#E8001A] border border-[#E8001A] dark:bg-[#E8001A]/10',
  'Ulang Tahun': 'text-pink-600 dark:text-pink-300 border border-pink-300 dark:border-pink-800/60 bg-pink-50 dark:bg-pink-950/40',
  'Konser': 'text-white bg-black dark:bg-neutral-800 border dark:border-neutral-700',
}

// ─── Components ──────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-0">
      <div className="bg-[#E8001A] px-3 py-1.5">
        <span
          className="font-display text-white tracking-[0.25em] font-light text-sm uppercase leading-none"
          style={{ letterSpacing: '0.28em' }}
        >
          WOTA48NET
        </span>
      </div>
    </div>
  )
}

function ThemeToggle({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
      title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
      className="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer items-center border border-black dark:border-white bg-white dark:bg-black p-[3px] transition-colors duration-200 focus:outline-none"
    >
      <span
        className={`pointer-events-none h-full w-6 bg-black dark:bg-white flex items-center justify-center transition-transform duration-200 ${
          darkMode ? 'translate-x-[26px]' : 'translate-x-0'
        }`}
      >
        {darkMode ? (
          <svg className="w-3.5 h-3.5 text-black fill-current" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

function Nav({
  active,
  setActive,
  darkMode,
  toggleDarkMode,
}: {
  active: NavItem | null;
  setActive: (n: NavItem) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}) {
  const items: NavItem[] = ['Kalender', 'Statistik', 'Tiket', 'Chant'];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#e5e5e5] dark:border-[#222222] transition-colors">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {items.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`text-sm font-medium transition-colors ${
                active === item
                  ? 'text-[#E8001A]'
                  : 'text-black dark:text-[#e5e5e5] hover:text-[#E8001A] dark:hover:text-[#E8001A]'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <button className="text-sm border border-black dark:border-white text-black dark:text-white px-4 py-1.5 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors font-medium">
            Daftar
          </button>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <button
            className="flex flex-col gap-1.5 p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span
              className={`w-5 h-px bg-black dark:bg-white transition-all ${
                mobileOpen ? 'rotate-45 translate-y-[5px]' : ''
              }`}
            />
            <span
              className={`w-5 h-px bg-black dark:bg-white transition-all ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-5 h-px bg-black dark:bg-white transition-all ${
                mobileOpen ? '-rotate-45 -translate-y-[5px]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e5e5e5] dark:border-[#222222] bg-white dark:bg-[#0a0a0a]">
          {items.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActive(item);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-6 py-3 text-sm border-b border-[#f0f0f0] dark:border-[#1c1c1c] ${
                active === item ? 'text-[#E8001A] font-medium' : 'text-black dark:text-[#e5e5e5]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// --- Hero ---------------------------------------------------------------------

function Hero({ onExplore }: { onExplore: (section: NavItem) => void }) {
  return (
    <section
      style={{ backgroundImage: `url(${heroBg})` }}
      className="relative border-b border-[#e5e5e5] dark:border-[#222222] bg-cover bg-center bg-no-repeat"
    >
      {/* Hero text block with overlay */}
      <div className="bg-white/80 dark:bg-[#0a0a0a]/85 backdrop-blur-[2px] transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <p className="text-xs tracking-[0.3em] uppercase text-[#E8001A] font-medium mb-6">
            Fan Platform untuk JKT48
          </p>
          <h1 className="font-display font-light text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-8 max-w-4xl text-black dark:text-white">
            Semua yang kamu<br />
            butuhkan sebagai<br />
            <span className="text-[#E8001A]">wota</span>
          </h1>
          <p className="text-base md:text-lg text-[#737373] dark:text-[#a3a3a3] max-w-xl leading-relaxed mb-10">
            Kalender teater, statistik oshi, pengingat tiket dan chant builder dalam satu platform yang bersih dan cepat.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onExplore('Kalender')}
              className="bg-[#E8001A] text-white px-6 py-3 text-sm font-medium hover:bg-[#C0001A] transition-colors"
            >
              Lihat Jadwal Teater
            </button>
            <button
              onClick={() => onExplore('Chant')}
              className="border border-black dark:border-white text-black dark:text-white px-6 py-3 text-sm font-medium hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"
            >
              Lirik & Chant Sync
            </button>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="border-t border-[#e5e5e5] dark:border-[#222222] bg-white/90 dark:bg-[#0d0d0d]/90 backdrop-blur-sm overflow-x-auto transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex min-w-max md:min-w-0">
          {[
            { label: 'Kalender Terintegrasi', desc: 'Sync ke Google/Apple Calendar', nav: 'Kalender' as NavItem },
            { label: 'Statistik Penampilan', desc: 'Data show & oshi tracker', nav: 'Statistik' as NavItem },
            { label: 'Pengingat Tiket', desc: 'Notif WhatsApp & email', nav: 'Tiket' as NavItem },
            { label: 'Chant & Lirik', desc: 'Lyric sync presisi', nav: 'Chant' as NavItem },
          ].map((f, i) => (
            <button
              key={i}
              onClick={() => onExplore(f.nav)}
              className="flex-1 min-w-[160px] text-left px-5 py-5 border-r border-[#e5e5e5] dark:border-[#222222] last:border-r-0 hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              <p className="text-xs font-semibold text-black dark:text-white mb-1">{f.label}</p>
              <p className="text-xs text-[#737373] dark:text-[#a3a3a3]">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section: Kalender ────────────────────────────────────────────────────────

function KalenderSection() {
  const [filter, setFilter] = useState<'Semua' | Event['type']>('Semua')
  const filters: Array<'Semua' | Event['type']> = ['Semua', 'Teater', '2-Shot', 'Ulang Tahun', 'Konser']

  const filtered = filter === 'Semua' ? events : events.filter(e => e.type === filter)

  return (
    <section id="kalender" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[#E8001A] font-medium mb-2">September 2026</p>
          <h2 className="font-display font-light text-4xl md:text-5xl text-black dark:text-white">Kalender Terintegrasi</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 border border-black dark:border-[#333333] text-black dark:text-[#e5e5e5] px-4 py-2 text-xs font-medium hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Google Calendar
          </button>
          <button className="flex items-center gap-2 border border-black dark:border-[#333333] text-black dark:text-[#e5e5e5] px-4 py-2 text-xs font-medium hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Apple Calendar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-0 mb-8 border border-[#e5e5e5] dark:border-[#262626] w-fit">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-medium transition-colors border-r border-[#e5e5e5] dark:border-[#262626] last:border-r-0 ${
              filter === f ? 'bg-[#E8001A] text-white' : 'bg-white dark:bg-[#121212] text-black dark:text-[#d4d4d4] hover:bg-[#f5f5f5] dark:hover:bg-[#1f1f1f]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="border-t border-[#e5e5e5] dark:border-[#222222]">
        {filtered.map((e, i) => (
          <div key={i} className="flex items-start gap-6 py-5 border-b border-[#e5e5e5] dark:border-[#222222] hover:bg-[#fafafa] dark:hover:bg-[#141414] transition-colors px-2 group">
            <div className="w-14 flex-shrink-0 text-center">
              <p className="font-display font-light text-3xl leading-none text-black dark:text-white">{e.date}</p>
              <p className="text-[10px] tracking-widest uppercase text-[#737373] dark:text-[#888888] mt-0.5">{e.day}</p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 ${typeColor[e.type]}`}>
                  {e.type}
                </span>
                <span className="text-xs text-[#737373]">{e.time}</span>
              </div>
              <p className="font-medium text-black dark:text-white text-sm">{e.title}</p>
              <p className="text-xs text-[#737373] dark:text-[#888888] mt-0.5">{e.location}</p>
            </div>
            <button className="hidden group-hover:flex items-center gap-1 text-xs text-[#E8001A] font-medium flex-shrink-0">
              + Tambah
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Section: Statistik ──────────────────────────────────────────────────────

function StatistikSection() {
  const [selectedMember, setSelectedMember] = useState(members[0])

  return (
    <section id="statistik" className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#E8001A] font-medium mb-2">Data September 2026</p>
        <h2 className="font-display font-light text-4xl md:text-5xl text-black dark:text-white">Statistik Penampilan</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-0 border border-[#e5e5e5] dark:border-[#222222] bg-white dark:bg-[#111111] transition-colors">
        {/* Oshi selector */}
        <div className="border-b md:border-b-0 md:border-r border-[#e5e5e5] dark:border-[#222222]">
          <p className="text-xs font-semibold tracking-widest uppercase px-5 py-3 border-b border-[#e5e5e5] dark:border-[#222222] text-[#737373] dark:text-[#888888]">
            Pilih Oshi
          </p>
          {members.map((m) => (
            <button
              key={m.name}
              onClick={() => setSelectedMember(m)}
              className={`w-full text-left px-5 py-4 border-b border-[#f0f0f0] dark:border-[#1c1c1c] last:border-b-0 transition-colors ${
                selectedMember.name === m.name ? 'bg-[#E8001A] text-white' : 'hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a]'
              }`}
            >
              <p className={`text-sm font-medium ${selectedMember.name === m.name ? 'text-white' : 'text-black dark:text-white'}`}>{m.name}</p>
              <p className={`text-xs mt-0.5 ${selectedMember.name === m.name ? 'text-red-200' : 'text-[#737373] dark:text-[#888888]'}`}>{m.team}</p>
            </button>
          ))}
        </div>

        {/* Oshi stats */}
        <div className="md:col-span-2 p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#737373] dark:text-[#888888] mb-5">
            {selectedMember.name} — {selectedMember.team}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Penampilan Bulan Ini', value: selectedMember.appearances.toString() },
              { label: 'Terakhir Tampil', value: selectedMember.lastShow },
              { label: 'Setlist Favorit', value: selectedMember.favoriteSet },
            ].map((s) => (
              <div key={s.label} className="border border-[#e5e5e5] dark:border-[#222222] bg-white dark:bg-[#161616] p-4 transition-colors">
                <p className="text-[10px] uppercase tracking-widest text-[#737373] dark:text-[#888888] mb-2">{s.label}</p>
                <p className="font-display font-light text-xl leading-tight text-black dark:text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Top songs */}
          <p className="text-xs font-semibold tracking-widest uppercase text-[#737373] dark:text-[#888888] mb-4">
            Lagu Paling Sering Dibawakan
          </p>
          <div className="space-y-3">
            {topSongs.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-5 text-xs text-[#737373] dark:text-[#888888] text-right">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-black dark:text-white">{s.title}</span>
                    <span className="text-xs text-[#737373]">{s.count}×</span>
                  </div>
                  <div className="h-1 bg-[#f0f0f0] dark:bg-[#222222] w-full">
                    <div
                      className="h-1 bg-[#E8001A] transition-all"
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Section: Tiket ──────────────────────────────────────────────────────────

function TiketSection() {
  const [method, setMethod] = useState<'whatsapp' | 'email'>('whatsapp')
  const [contact, setContact] = useState('')
  const [hours, setHours] = useState('2')
  const [submitted, setSubmitted] = useState(false)

  const upcoming = [
    { date: '20 Sep 2026', show: 'Setlist Shonichi — 13.00', ticketOpen: '19 Sep 09:00', status: 'open' },
    { date: '20 Sep 2026', show: 'Setlist Shonichi — 18.30', ticketOpen: '19 Sep 09:00', status: 'open' },
    { date: '25 Sep 2026', show: 'Setlist Beginner — 18.30', ticketOpen: '24 Sep 09:00', status: 'upcoming' },
    { date: '27 Sep 2026', show: 'Setlist Pajama Drive — 13.00', ticketOpen: '26 Sep 09:00', status: 'upcoming' },
  ]

  return (
    <section id="tiket" className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#E8001A] font-medium mb-2">Ticket War</p>
        <h2 className="font-display font-light text-4xl md:text-5xl text-black dark:text-white">Pengingat Tiket Otomatis</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-0 border border-[#e5e5e5] dark:border-[#222222] bg-white dark:bg-[#111111] transition-colors">
        {/* Form */}
        <div className="border-b md:border-b-0 md:border-r border-[#e5e5e5] dark:border-[#222222] p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#737373] dark:text-[#888888] mb-6">Atur Pengingat</p>

          {submitted ? (
            <div className="border border-[#E8001A] bg-red-50 dark:bg-red-950/30 p-6 text-center">
              <p className="text-[#E8001A] font-semibold text-sm mb-1">Pengingat Aktif!</p>
              <p className="text-xs text-[#737373] dark:text-[#a3a3a3]">Kamu akan dapat notif {hours} jam sebelum penjualan tiket dimulai.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs text-[#737373] dark:text-[#a3a3a3] underline"
              >
                Ubah pengingat
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }} className="space-y-4">
              {/* Method toggle */}
              <div>
                <p className="text-xs text-[#737373] dark:text-[#888888] mb-2 font-medium">Metode Notifikasi</p>
                <div className="flex border border-[#e5e5e5] dark:border-[#262626]">
                  {(['whatsapp', 'email'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${
                        method === m ? 'bg-[#E8001A] text-white' : 'bg-white dark:bg-[#161616] text-black dark:text-[#d4d4d4] hover:bg-[#f5f5f5] dark:hover:bg-[#222222]'
                      }`}
                    >
                      {m === 'whatsapp' ? 'WhatsApp' : 'Email'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#737373] dark:text-[#888888] font-medium block mb-1.5">
                  {method === 'whatsapp' ? 'Nomor WhatsApp' : 'Alamat Email'}
                </label>
                <input
                  type={method === 'whatsapp' ? 'tel' : 'email'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={method === 'whatsapp' ? '+62 812 xxxx xxxx' : 'wota@email.com'}
                  className="w-full border border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#161616] text-black dark:text-white px-3 py-2.5 text-sm outline-none focus:border-[#E8001A] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#737373] font-medium block mb-1.5">
                  Ingatkan berapa jam sebelumnya?
                </label>
                <select
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full border border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#161616] text-black dark:text-white px-3 py-2.5 text-sm outline-none focus:border-[#E8001A]"
                >
                  {['1', '2', '3', '6', '12', '24'].map(h => (
                    <option key={h} value={h}>{h} jam sebelum</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E8001A] text-white py-3 text-sm font-medium hover:bg-[#C0001A] transition-colors"
              >
                Aktifkan Pengingat
              </button>
            </form>
          )}
        </div>

        {/* Upcoming ticket sales */}
        <div className="p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#737373] dark:text-[#888888] mb-6">Penjualan Tiket Mendatang</p>
          <div className="space-y-0 border border-[#e5e5e5] dark:border-[#222222]">
            {upcoming.map((t, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border-b border-[#f0f0f0] dark:border-[#1c1c1c] last:border-b-0">
                <div
                  className={`w-2 h-2 mt-1.5 flex-shrink-0 ${
                    t.status === 'open' ? 'bg-[#E8001A]' : 'bg-[#e5e5e5] dark:bg-[#333333]'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black dark:text-white">{t.show}</p>
                  <p className="text-xs text-[#737373] dark:text-[#888888] mt-0.5">{t.date}</p>
                  <p className="text-[10px] text-[#737373] dark:text-[#888888] mt-1">
                    Tiket dibuka: <span className="font-semibold text-black dark:text-white">{t.ticketOpen}</span>
                  </p>
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 flex-shrink-0 ${
                    t.status === 'open'
                      ? 'bg-[#E8001A] text-white'
                      : 'border border-[#e5e5e5] dark:border-[#333333] text-[#737373] dark:text-[#888888]'
                  }`}
                >
                  {t.status === 'open' ? 'Buka' : 'Segera'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Section: Chant & Lirik ──────────────────────────────────────────────────

function ChantSection() {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(32)
  const [activeLine, setActiveLine] = useState(2)

  const lyrics = [
    { time: '0:00', text: 'Fortune Cookie ni Koishite~', chant: null },
    { time: '0:04', text: 'Minna no yume ga kanau you ni', chant: null },
    { time: '0:08', text: '(Oshi no namae)!', chant: 'FREYA!' },
    { time: '0:12', text: 'Mirai wa mienai kedo~', chant: null },
    { time: '0:16', text: '(Hai!) Fight-o!', chant: 'HAI! FIGHT-O!' },
    { time: '0:20', text: 'Kono te wo nobashite~', chant: null },
    { time: '0:24', text: 'Tsukande miseru yo', chant: null },
  ]

  return (
    <section id="chant" className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#E8001A] font-medium mb-2">Sinkronisasi Presisi</p>
        <h2 className="font-display font-light text-4xl md:text-5xl text-black dark:text-white">Lirik & Chant Sync</h2>
      </div>

      <div className="border border-[#e5e5e5] dark:border-[#222222] bg-white dark:bg-[#111111] transition-colors">
        {/* Player header */}
        <div className="border-b border-[#e5e5e5] dark:border-[#222222] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm text-black dark:text-white">Koisuru Fortune Cookie</p>
            <p className="text-xs text-[#737373]">JKT48 — Team J Setlist</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlaying(!playing)}
              className="w-8 h-8 bg-[#E8001A] flex items-center justify-center hover:bg-[#C0001A] transition-colors"
            >
              {playing ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3 border-b border-[#e5e5e5] dark:border-[#222222]">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#737373] w-8">0:32</span>
            <div
              className="flex-1 h-0.5 bg-[#e5e5e5] dark:bg-[#262626] relative cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setProgress(Math.round(((e.clientX - rect.left) / rect.width) * 100))
              }}
            >
              <div className="h-0.5 bg-[#E8001A] transition-all" style={{ width: `${progress}%` }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#E8001A]"
                style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
              />
            </div>
            <span className="text-xs text-[#737373] w-8">1:38</span>
          </div>
        </div>

        {/* Lyrics */}
        <div className="divide-y divide-[#f0f0f0] dark:divide-[#1c1c1c]">
          {lyrics.map((line, i) => (
            <div
              key={i}
              onClick={() => setActiveLine(i)}
              className={`flex items-start gap-4 px-6 py-3.5 cursor-pointer transition-colors ${
                i === activeLine ? 'bg-red-50' : 'hover:bg-[#fafafa] dark:hover:bg-[#161616]'
              }`}
            >
              <span className="text-[10px] text-[#737373] w-8 mt-0.5 flex-shrink-0 font-mono">{line.time}</span>
              <p className={`text-sm flex-1 ${i === activeLine ? 'text-[#E8001A] font-semibold' : 'text-black dark:text-[#e5e5e5]'}`}>
                {line.text}
              </p>
              {line.chant && (
                <span className={`text-[10px] font-bold tracking-widest flex-shrink-0 ${
                  i === activeLine ? 'text-[#E8001A]' : 'text-[#737373]'
                }`}>
                  {line.chant}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="border-t border-[#e5e5e5] dark:border-[#222222] px-6 py-3 flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-50 dark:bg-red-950/40 border border-[#E8001A]" />
            <span className="text-xs text-[#737373]">Baris aktif (saat ini)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#737373]">TEKS MERAH</span>
            <span className="text-xs text-[#737373]">= waktunya chant</span>
          </div>
        </div>
      </div>
    </section>
  )
}


// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-black text-white mt-16 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="bg-[#E8001A] inline-block px-3 py-1.5 mb-5">
            <span className="font-display text-white tracking-[0.28em] font-light text-sm">WOTA48NET</span>
          </div>
          <p className="text-sm text-[#a3a3a3] leading-relaxed max-w-xs">
            Platform fans JKT48 terlengkap — kalender, statistik, tiket, dan komunitas dalam satu tempat.
          </p>
        </div>
        <div>
          <p className="text-[10px] tracking-widest uppercase text-[#525252] font-semibold mb-4">Fitur</p>
          <ul className="space-y-2">
            {['Kalender Teater', 'Statistik Penampilan', 'Pengingat Tiket', 'Chant Sync', 'Wotagei Guide', 'Chant Builder'].map(l => (
              <li key={l}>
                <a href="#" className="text-sm text-[#a3a3a3] hover:text-white transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] tracking-widest uppercase text-[#525252] font-semibold mb-4">Komunitas</p>
          <ul className="space-y-2">
            {['Discord Wota48', 'Twitter / X', 'Instagram', 'Tentang Kami', 'Kebijakan Privasi'].map(l => (
              <li key={l}>
                <a href="#" className="text-sm text-[#a3a3a3] hover:text-white transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[#262626] max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <p className="text-xs text-[#525252]">© 2026 wota48net — Fan-made, bukan afiliasi resmi JKT48.</p>
      </div>
    </footer>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSection, setActiveSection] = useState<NavItem | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleExplore = (section: NavItem) => {
    setActiveSection(section);
    setTimeout(() => {
      document.getElementById(section.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-[#f5f5f5] font-['Inter',sans-serif] transition-colors duration-200">
      <Nav
        active={activeSection}
        setActive={handleExplore}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <main>
        <Hero onExplore={handleExplore} />
        <div className="border-b border-[#e5e5e5] dark:border-[#222222]">
          <KalenderSection />
        </div>
        <div className="border-b border-[#e5e5e5] dark:border-[#222222] bg-[#fafafa] dark:bg-[#0e0e0e] transition-colors">
          <StatistikSection />
        </div>
        <div className="border-b border-[#e5e5e5] dark:border-[#222222]">
          <TiketSection />
        </div>
        <div className="border-b border-[#e5e5e5] dark:border-[#222222] bg-[#fafafa] dark:bg-[#0e0e0e] transition-colors">
          <ChantSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
