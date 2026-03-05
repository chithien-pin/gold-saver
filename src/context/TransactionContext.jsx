import React, { createContext, useContext, useReducer } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_KEY } from '../constants'
import { getSeedTransactions } from '../data/seed'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seed = getSeedTransactions()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = getSeedTransactions()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
    return parsed
  } catch {
    return getSeedTransactions()
  }
}

function saveToStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('Failed to save transactions', e)
  }
}

function transactionReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return loadFromStorage()
    case 'ADD':
      const newTx = {
        ...action.payload,
        id: action.payload.id || uuidv4(),
      }
      const next = [newTx, ...state]
      saveToStorage(next)
      return next
    case 'DELETE':
      const filtered = state.filter((t) => t.id !== action.payload.id)
      saveToStorage(filtered)
      return filtered
    default:
      return state
  }
}

const TransactionContext = createContext(null)

export function TransactionProvider({ children }) {
  const [transactions, dispatch] = useReducer(transactionReducer, undefined, loadFromStorage)

  const addTransaction = (payload) => dispatch({ type: 'ADD', payload })
  const deleteTransaction = (id) => dispatch({ type: 'DELETE', payload: { id } })

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction, dispatch }}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider')
  return ctx
}
