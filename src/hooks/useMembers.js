import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMembers(tripId) {
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (!tripId) return

    supabase.from('members').select('*').eq('trip_id', tripId).order('created_at')
      .then(({ data }) => setMembers(data || []))

    const sub = supabase.channel(`members-${tripId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `trip_id=eq.${tripId}` },
        payload => {
          if (payload.eventType === 'INSERT') setMembers(p => [...p, payload.new])
          if (payload.eventType === 'DELETE') setMembers(p => p.filter(m => m.id !== payload.old.id))
        })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [tripId])

  async function addMember(name) {
    const { data } = await supabase.from('members').insert({ trip_id: tripId, name }).select().single()
    return data
  }

  async function removeMember(id) {
    await supabase.from('members').delete().eq('id', id)
  }

  return { members, addMember, removeMember }
}