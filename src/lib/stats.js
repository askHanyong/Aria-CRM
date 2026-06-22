import { supabase } from './supabase'

// Returns the last `n` calendar months as 'YYYY-MM' strings, oldest first.
function lastNMonths(n) {
  const months = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

function monthLabel(ym) {
  return new Date(ym + '-02').toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
}

export async function fetchDashboardStats() {
  const { data, error } = await supabase
    .from('certificates')
    .select('level_of_award, course_date, organisation')
    .eq('voided', false)

  if (error) throw error

  const byLevel = {}
  const byMonthRaw = {}
  const byOrg = {}

  const months = lastNMonths(12)
  months.forEach(m => { byMonthRaw[m] = 0 })

  data.forEach(({ level_of_award, course_date, organisation }) => {
    // By level
    if (level_of_award) byLevel[level_of_award] = (byLevel[level_of_award] || 0) + 1

    // By month of course_date (only within the last 12 months window)
    if (course_date) {
      const ym = course_date.slice(0, 7)          // 'YYYY-MM'
      if (ym in byMonthRaw) byMonthRaw[ym]++
    }

    // By organisation
    if (organisation) byOrg[organisation] = (byOrg[organisation] || 0) + 1
  })

  const levelOrder = ['CP1', 'One Star', 'Two Star', 'Three Star']
  const levelData = levelOrder
    .filter(l => l in byLevel)
    .map(l => ({ name: l, count: byLevel[l] }))
  // Append any unexpected levels
  Object.entries(byLevel).forEach(([l, c]) => {
    if (!levelOrder.includes(l)) levelData.push({ name: l, count: c })
  })

  const monthData = months.map(ym => ({
    month: monthLabel(ym),
    count: byMonthRaw[ym],
  }))

  const orgData = Object.entries(byOrg)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const issuedThisMonth = byMonthRaw[months[months.length - 1]] ?? 0

  return {
    total: data.length,
    issuedThisMonth,
    levelData,
    monthData,
    orgData,
  }
}
