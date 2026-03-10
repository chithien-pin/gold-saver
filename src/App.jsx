import { useState } from 'react'
import { TransactionProvider, useTransactions } from './context/TransactionContext'
import { SHEET_TABS } from './constants'
import Dashboard from './components/Dashboard'
import AddTransaction from './components/AddTransaction'
import TransactionHistory from './components/TransactionHistory'

const SECTIONS = [
  { id: 'dashboard', label: 'Tổng quan', icon: ChartIcon },
  { id: 'add', label: 'Thêm Giao Dịch', icon: PlusIcon },
  { id: 'history', label: 'Lịch Sử Giao Dịch', icon: HistoryIcon },
]

function ChartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function StarIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 640 640" stroke="currentColor" strokeWidth={2}>
      <path fill='#FFF' d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"/>
    </svg>
  )
}
function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
function HistoryIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function AppContent() {
  const [active, setActive] = useState('dashboard')
  const [navOpen, setNavOpen] = useState(false)
  const { currentSheet, setCurrentSheet } = useTransactions()

  const renderSection = () => {
    switch (active) {
      case 'dashboard':
        return <Dashboard />
      case 'add':
        return <AddTransaction />
      case 'history':
        return <TransactionHistory onNavigateToAdd={() => setActive('add')} />
      default:
        return <Dashboard />
    }
  }

  const greeting = 'Xin chào'
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row rounded-panel bg-white shadow-soft-lg overflow-hidden min-h-[calc(100vh-3rem)] md:min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
        {/* Sidebar - InsightHub style */}
        <aside className="lg:w-60 flex-shrink-0 bg-white lg:border-r border-gray-100">
          <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <StarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 block leading-tight">Gold Saver</span>
                <span className="text-xs text-gray-500">Dashboard</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
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
          <nav className={`${navOpen ? 'block' : 'hidden'} lg:block py-4 px-3`}>
            <ul className="space-y-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(s.id)
                      setNavOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      active === s.id
                        ? 'bg-primary text-white shadow-soft'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <s.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-0">
          <header className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 md:px-6 lg:px-8 py-4 md:py-5 border-b border-gray-100">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{greeting}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{today}</p>
            </div>
            {/* Tab Vàng Con / Vàng Mẹ */}
            <div className="flex rounded-xl bg-gray-100 p-1 w-fit">
              {SHEET_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCurrentSheet(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentSheet === tab
                      ? 'bg-white text-primary shadow-soft'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto animate-fade-in">
              {renderSection()}
            </div>
          </div>
        </main>
      </div>
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
