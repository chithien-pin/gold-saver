import { useState } from 'react'
import { TransactionProvider } from './context/TransactionContext'
import Dashboard from './components/Dashboard'
import AddTransaction from './components/AddTransaction'
import TransactionHistory from './components/TransactionHistory'

const SECTIONS = [
  { id: 'dashboard', label: 'Tổng quan', icon: ChartIcon },
  { id: 'add', label: 'Nhập Giao Dịch', icon: PlusIcon },
  { id: 'history', label: 'Lịch Sử Giao Dịch', icon: HistoryIcon },
]

function ChartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}
function HistoryIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function AppContent() {
  const [active, setActive] = useState('dashboard')
  const [navOpen, setNavOpen] = useState(false)

  const renderSection = () => {
    switch (active) {
      case 'dashboard':
        return <Dashboard />
      case 'add':
        return <AddTransaction />
      case 'history':
        return <TransactionHistory />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-56 flex-shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-gray-200">
        <div className="flex items-center justify-between lg:justify-center h-14 lg:h-20 px-4 border-b border-gray-200">
          <span className="font-display text-lg font-semibold text-gold-dark">
            Gold Tracker
          </span>
          <button
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {navOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        <nav
          className={`${
            navOpen ? 'block' : 'hidden'
          } lg:block py-4`}
        >
          <ul className="space-y-0.5 px-3">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(s.id)
                    setNavOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    active === s.id
                      ? 'bg-gold/15 text-gold-dark border border-gold/30'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <s.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {renderSection()}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <TransactionProvider>
      <AppContent />
    </TransactionProvider>
  )
}
