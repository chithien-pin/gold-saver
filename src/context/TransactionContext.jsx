import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import * as sheetsApi from '../api/sheets'

const initialState = []

function transactionReducer(state, action) {
  switch (action.type) {
    case 'SET':
      return action.payload ?? []
    case 'ADD':
      return [action.payload, ...state]
    case 'DELETE':
      return state.filter((t) => t.id !== action.payload.id)
    default:
      return state
  }
}

const TransactionContext = createContext(null)

export function TransactionProvider({ children }) {
  const [transactions, dispatch] = useReducer(transactionReducer, initialState)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await sheetsApi.getTransactions()
      dispatch({ type: 'SET', payload: list })
    } catch (e) {
      setError(e.message)
      dispatch({ type: 'SET', payload: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const addTransaction = useCallback(async (payload) => {
    const tx = {
      ...payload,
      id: payload.id || uuidv4(),
    }
    await sheetsApi.addTransaction(tx)
    dispatch({ type: 'ADD', payload: tx })
    return tx
  }, [])

  const deleteTransaction = useCallback(async (id) => {
    await sheetsApi.deleteTransaction(id)
    dispatch({ type: 'DELETE', payload: { id } })
  }, [])

  const value = {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    refresh: loadTransactions,
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider')
  return ctx
}
