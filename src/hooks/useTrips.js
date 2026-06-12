import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('trips').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setTrips(data || []); setLoading(false) })
  }, [])

  async function createTrip(name) {
    const { data, error } = await supabase.from('trips').insert({ name }).select().single()
    if (!error) setTrips(p => [data, ...p])
    return data
  }

  return { trips, loading, createTrip }
}