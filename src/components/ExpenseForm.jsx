import { useState } from 'react'

export default function ExpenseForm({ members, onSave, onCancel, initial }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [amount, setAmount] = useState(initial?.amount || '')
  const [paidBy, setPaidBy] = useState(initial?.paid_by || '')
  const [sharedBy, setSharedBy] = useState(initial?.shared_by || members.map(m => m.id))

  function toggleShare(id) {
    setSharedBy(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  function handleSave() {
    if (!title || !amount || !paidBy || sharedBy.length === 0) return
    onSave({ title, amount: parseFloat(amount), paid_by: paidBy, shared_by: sharedBy })
  }

  return (
    <div style={{ background: '#fff', padding: '16px', borderRadius: 16, border: '1.5px solid #eee', marginBottom: 16 }}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="ชื่อรายการ..."
        style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #eee', fontSize: 14, boxSizing: 'border-box', marginBottom: 10 }} />
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="จำนวนเงิน (บาท)"
        style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #eee', fontSize: 14, boxSizing: 'border-box', marginBottom: 10 }} />
      <select value={paidBy} onChange={e => setPaidBy(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #eee', fontSize: 14, boxSizing: 'border-box', marginBottom: 12 }}>
        <option value="">ใครจ่าย?</option>
        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 8, fontWeight: 600 }}>แบ่งกับใคร?</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {members.map(m => (
          <button key={m.id} onClick={() => toggleShare(m.id)}
            style={{
              padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
              borderColor: sharedBy.includes(m.id) ? '#A0C4FF' : '#eee',
              background: sharedBy.includes(m.id) ? '#daeeff' : '#fafafa',
              color: sharedBy.includes(m.id) ? '#2055a0' : '#aaa',
            }}>{m.name}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid #eee', background: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>ยกเลิก</button>
        <button onClick={handleSave} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: '#cdb4db', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 700 }}>บันทึก ✓</button>
      </div>
    </div>
  )
}