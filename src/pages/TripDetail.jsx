import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMembers } from '../hooks/useMembers'
import { useExpenses } from '../hooks/useExpenses'
import { supabase } from '../lib/supabase'
import ExpenseForm from '../components/ExpenseForm'
import SettlementSummary from '../components/SettlementSummary'

export default function TripDetail() {
  const { tripId } = useParams()
  const nav = useNavigate()
  const { members, addMember, removeMember } = useMembers(tripId)
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses(tripId)
  const [showForm, setShowForm] = useState(false)
  const [editExp, setEditExp] = useState(null)
  const [newMember, setNewMember] = useState('')
  const [tab, setTab] = useState('expenses')

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0)
  const memberMap = Object.fromEntries(members.map(m => [m.id, m.name]))

  function copyInvite() {
    supabase.from('trips').select('invite_code').eq('id', tripId).single()
      .then(({ data }) => {
        navigator.clipboard.writeText(`${window.location.origin}/join/${data.invite_code}`)
        alert('คัดลอก invite link แล้ว! 🎉')
      })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', color: '#666' }}>← กลับ</button>
        <button onClick={copyInvite} style={{ padding: '6px 12px', borderRadius: 10, background: '#fafafa', border: '1.5px solid #eee', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🔗 Invite</button>
      </div>

      {/* Members */}
      <div style={{ background: '#fdf8ff', padding: '14px', borderRadius: 16, border: '1.5px solid #f0e0f8', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#6a3080', marginBottom: 10 }}>👥 สมาชิก</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {members.map(m => (
            <span key={m.id} style={{ padding: '4px 12px', borderRadius: 100, background: '#eedff5', color: '#6a3080', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              onClick={() => { if (window.confirm(`ลบ ${m.name}?`)) removeMember(m.id) }}>
              {m.name} ✕
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newMember} onChange={e => setNewMember(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newMember.trim()) { addMember(newMember.trim()); setNewMember('') } }}
            placeholder="เพิ่มสมาชิก..."
            style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e8d8f0', fontSize: 13 }} />
          <button onClick={() => { if (newMember.trim()) { addMember(newMember.trim()); setNewMember('') } }}
            style={{ padding: '8px 14px', borderRadius: 10, background: '#cdb4db', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>+</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[['expenses', '🧾 รายการ'], ['settle', '💸 Settlement']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid',
              borderColor: tab === key ? '#FFB6C1' : '#eee',
              background: tab === key ? '#fff0f3' : '#fafafa',
              color: tab === key ? '#b84d66' : '#aaa',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>{label}</button>
        ))}
      </div>

      {tab === 'expenses' && (
        <>
          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>รวมทั้งหมด</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#333' }}>฿{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Add button */}
          {!showForm && !editExp && (
            <button onClick={() => setShowForm(true)}
              style={{ width: '100%', padding: '13px', borderRadius: 16, border: '2px dashed #FFD6A5', background: '#fffaf5', color: '#b87430', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>
              + เพิ่มรายการ
            </button>
          )}

          {/* Add form */}
          {showForm && (
            <ExpenseForm members={members}
              onSave={exp => { addExpense(exp); setShowForm(false) }}
              onCancel={() => setShowForm(false)} />
          )}

          {/* Expense list */}
          {expenses.map(exp => (
            <div key={exp.id} style={{ background: '#fff', padding: '14px', borderRadius: 16, border: '1.5px solid #eee', marginBottom: 10 }}>
              {editExp?.id === exp.id ? (
                <ExpenseForm members={members} initial={exp}
                  onSave={data => { updateExpense(exp.id, data); setEditExp(null) }}
                  onCancel={() => setEditExp(null)} />
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: '#333' }}>{exp.title}</span>
                    <span style={{ fontWeight: 700, color: '#333' }}>฿{parseFloat(exp.amount).toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
                    💳 จ่ายโดย {memberMap[exp.paid_by]}
                    {' · '}แบ่ง {exp.shared_by.length} คน = ฿{(exp.amount / exp.shared_by.length).toFixed(2)}/คน
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditExp(exp)}
                      style={{ fontSize: 12, padding: '4px 12px', borderRadius: 8, border: '1.5px solid #A0C4FF', background: '#daeeff', color: '#2055a0', cursor: 'pointer', fontWeight: 600 }}>แก้ไข</button>
                    <button onClick={() => { if (window.confirm('ลบรายการนี้?')) deleteExpense(exp.id) }}
                      style={{ fontSize: 12, padding: '4px 12px', borderRadius: 8, border: '1.5px solid #FFB6C1', background: '#fff0f3', color: '#b84d66', cursor: 'pointer', fontWeight: 600 }}>ลบ</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </>
      )}

      {tab === 'settle' && <SettlementSummary members={members} expenses={expenses} />}
    </div>
  )
}