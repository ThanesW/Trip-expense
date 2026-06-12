export default function SettlementSummary({ members, expenses }) {
  const memberMap = Object.fromEntries(members.map(m => [m.id, m.name]))

  // คำนวณ net balance
  const balances = {}
  members.forEach(m => balances[m.id] = 0)

  expenses.forEach(exp => {
    const share = exp.amount / exp.shared_by.length
    exp.shared_by.forEach(id => { if (balances[id] !== undefined) balances[id] -= share })
    if (balances[exp.paid_by] !== undefined) balances[exp.paid_by] += exp.amount
  })

  // Greedy settlement
  const settlements = []
  const b = { ...balances }
  for (let i = 0; i < 1000; i++) {
    const cred = Object.entries(b).filter(([, v]) => v > 0.01).sort((a, c) => c[1] - a[1])
    const debt = Object.entries(b).filter(([, v]) => v < -0.01).sort((a, c) => a[1] - c[1])
    if (!cred.length || !debt.length) break

    const [cr, ca] = cred[0], [de, da] = debt[0]
    const amt = Math.min(ca, -da)

    settlements.push({ from: de, to: cr, amount: amt })
    b[cr] -= amt; b[de] += amt
  }

  if (settlements.length === 0)
    return <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>🎉 ไม่มียอดค้างชำระ!</div>

  return (
    <div style={{ background: '#fff', padding: '16px', borderRadius: 16, border: '1.5px solid #eee' }}>
      {settlements.map((s, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < settlements.length - 1 ? '1px solid #eee' : 'none', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            <strong style={{ color: '#ff85a2' }}>{memberMap[s.from]}</strong> 
            <span style={{ color: '#aaa', margin: '0 8px' }}>→</span> 
            <strong style={{ color: '#2055a0' }}>{memberMap[s.to]}</strong>
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>฿{s.amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}