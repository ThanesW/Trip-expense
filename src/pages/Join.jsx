import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Join() {
  const { inviteCode } = useParams()
  const [name, setName] = useState('')
  const [trip, setTrip] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    supabase.from('trips').select('*').eq('invite_code', inviteCode).single()
      .then(({ data }) => setTrip(data))
  }, [inviteCode])

  async function handleJoin() {
    if (!name.trim() || !trip) return
    await supabase.from('members').insert({ trip_id: trip.id, name: name.trim() })
    nav(`/trip/${trip.id}`)
  }

  if (!trip) return <div style={{ textAlign: 'center', padding: '50px', color: '#aaa' }}>กำลังโหลด...</div>

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>เข้าร่วมทริป</h2>
      <p style={{ color: '#6a3080', fontWeight: 700, marginBottom: 24, fontSize: 18 }}>{trip.name}</p>
      <input
        value={name} onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleJoin()}
        placeholder="ชื่อของคุณ..."
        style={{ padding: '12px 16px', borderRadius: 14, border: '1.5px solid #e0e0e0', fontSize: 15, width: '80%', display: 'block', margin: '0 auto 16px', textAlign: 'center' }}
      />
      <button onClick={handleJoin} style={{ padding: '12px 30px', borderRadius: 14, background: '#cdb4db', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>เข้าร่วม 🎉</button>
    </div>
  )
}