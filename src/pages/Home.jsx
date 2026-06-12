import { useState } from 'react'
import { useNavigate as useNav } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'

export default function Home() {
  const { trips, loading, createTrip } = useTrips()
  const [name, setName] = useState('')
  const nav = useNav()

  async function handleCreate() {
    if (!name.trim()) return
    const trip = await createTrip(name.trim())
    setName('')
    nav(`/trip/${trip.id}`)
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#333', marginBottom: 20 }}>🧳 Trips</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="ชื่อทริปใหม่..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0e0e0', fontSize: 15 }}
        />
        <button onClick={handleCreate} style={{ padding: '10px 20px', borderRadius: 12, background: '#cdb4db', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>+ สร้าง</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#aaa' }}>กำลังโหลด...</div>
      ) : (
        trips.map(t => (
          <div key={t.id} onClick={() => nav(`/trip/${t.id}`)}
            style={{ padding: '16px', borderRadius: 16, border: '1.5px solid #f0e0f8', marginBottom: 10, cursor: 'pointer', background: '#fdf8ff' }}>
            <div style={{ fontWeight: 700, color: '#333', marginBottom: 4 }}>🌍 {t.name}</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>Invite: {window.location.origin}/join/{t.invite_code}</div>
          </div>
        ))
      )}
    </div>
  )
}