import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TripDetail from './pages/TripDetail'
import Join from './pages/Join'

export default function App() {
  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trip/:tripId" element={<TripDetail />} />
        <Route path="/join/:inviteCode" element={<Join />} />
      </Routes>
    </div>
  )
}