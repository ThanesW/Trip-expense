import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useExpenses(tripId) {
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    if (!tripId) return

    supabase.from('expenses').select('*').eq('trip_id', tripId).order('created_at')
      .then(({ data }) => setExpenses(data || []))

    const sub = supabase.channel(`expenses-${tripId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${tripId}` },
        payload => {
          if (payload.eventType === 'INSERT') setExpenses(p => [...p, payload.new])
          if (payload.eventType === 'UPDATE') setExpenses(p => p.map(e => e.id === payload.new.id ? payload.new : e))
          if (payload.eventType === 'DELETE') setExpenses(p => p.filter(e => e.id !== payload.old.id))
        })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [tripId])

  async function addExpense(exp) {
    await supabase.from('expenses').insert({ ...exp, trip_id: tripId })
  }

  async function updateExpense(id, exp) {
    await supabase.from('expenses').update(exp).eq('id', id)
  }

  async function deleteExpense(id) {
    await supabase.from('expenses').delete().eq('id', id)
  }

  return { expenses, addExpense, updateExpense, deleteExpense }
}