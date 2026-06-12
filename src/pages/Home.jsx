import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate as useNav } from 'react-router-dom' // ใช้ตัวเดิมของคุณ
import { useTrips } from '../hooks/useTrips'
import { supabase } from '../lib/supabase'

// ➡️ วางตรงนี้ได้เลย (Privacy helper)
const MY_TRIPS_KEY = 'my_trip_ids'
function getMyTripIds() {
  try { return JSON.parse(localStorage.getItem(MY_TRIPS_KEY) || '[]') } catch { return [] }
}
function saveMyTripId(id) {
  const ids = getMyTripIds()
  if (!ids.includes(id)) localStorage.setItem(MY_TRIPS_KEY, JSON.stringify([...ids, id]))
}
function removeMyTripId(id) {
  localStorage.setItem(MY_TRIPS_KEY, JSON.stringify(getMyTripIds().filter(x => x !== id)))
}

export default function Home() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const nav = useNav() // 🛠️ ปรับตามตัวแปรเดิมที่คุณตั้งชื่อไว้ตอนแรก

  // fetch เฉพาะ trips ที่ตัวเองเกี่ยวข้องจาก localStorage
  useEffect(() => {
    const ids = getMyTripIds()
    if (ids.length === 0) { setLoading(false); return }
    supabase.from('trips').select('*').in('id', ids).order('created_at', { ascending: false })
      .then(({ data }) => { setTrips(data || []); setLoading(false) })
  }, [])

  // บันทึก trip id ลง localStorage ทันทีหลังกดสร้างทริปใหม่
  async function handleCreate() {
    if (!name.trim()) return
    const { data } = await supabase.from('trips').insert({ name: name.trim() }).select().single()
    if (data) { saveMyTripId(data.id); setName(''); nav(`/trip/${data.id}`) }
  }

  // ฟังก์ชันลบข้อมูลออกจากทั้ง Supabase, State หน้าจอ และ LocalStorage
  async function handleDelete(tripId) {
    await supabase.from('trips').delete().eq('id', tripId)
    removeMyTripId(tripId)
    setTrips(p => p.filter(t => t.id !== tripId))
  }

  return (
    <div style={{ paddingTop: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>🧳 Trips</h1>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <input value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="ชื่อทริปใหม่..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0e0e0', fontSize: 15 }} />
        <button onClick={handleCreate}
          style={{ padding: '10px 20px', borderRadius: 12, background: '#FFB6C1', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
          + สร้าง
        </button>
      </div>

      {loading ? <p>กำลังโหลด...</p> : trips.length === 0
        ? <p style={{ color: '#aaa', textAlign: 'center', paddingTop: 40 }}>ยังไม่มีทริป สร้างเลย! 🌍</p>
        : trips.map(t => <SwipeCard key={t.id} trip={t} onDelete={handleDelete} onNavigate={nav} />)
      }
    </div>
  )
}// ➡️ วางล่างสุดของไฟล์ (ฟังก์ชันคอมโพเนนต์แยกสำหรับลากปัดการ์ดทริป)
function SwipeCard({ trip, onDelete, onNavigate }) {
  const startX = useRef(0)
  const [offset, setOffset] = useState(0)
  const THRESHOLD = 72 

  const onTouchStart = e => { startX.current = e.touches[0].clientX }
  const onTouchMove  = e => {
    const dx = e.touches[0].clientX - startX.current
    if (dx < 0) setOffset(Math.max(dx, -THRESHOLD)) 
  }
  const onTouchEnd   = () => { if (offset > -THRESHOLD / 2) setOffset(0) }

  return (
    <div style={{ position: 'relative', marginBottom: 10, borderRadius: 16, overflow: 'hidden' }}>
      {/* ปุ่มลบสีแดงที่อยู่ข้างหลัง */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: THRESHOLD,
        background: '#ff4d6d', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 16, cursor: 'pointer',
      }} onClick={() => onDelete(trip.id)}>
        <span style={{ fontSize: 22 }}>🗑️</span>
      </div>

      {/* หน้าการ์ดหลักที่จะเลื่อนตามการลากนิ้ว */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => offset === 0 && onNavigate(`/trip/${trip.id}`)}
        style={{
          transform: `translateX(${offset}px)`,
          transition: offset === 0 ? 'transform 0.25s ease' : 'none',
          padding: '16px', borderRadius: 16,
          border: '1.5px solid #f0e0f8', background: '#fdf8ff',
          cursor: 'pointer', position: 'relative', zIndex: 1,
        }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>🌍 {trip.name}</div>
      </div>
    </div>
  )
}