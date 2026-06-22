import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell,
} from 'recharts'
import { fetchDashboardStats } from '../lib/stats'
import styles from './Dashboard.module.css'

const LEVEL_COLORS = {
  'CP1':       '#6366f1',
  'One Star':  '#8b5cf6',
  'Two Star':  '#3b82f6',
  'Three Star':'#0ea5e9',
}
const DEFAULT_BAR_COLOR = '#6366f1'

function StatCard({ label, value, sub }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>{title}</h3>
      {children}
    </div>
  )
}

const OrgTick = ({ x, y, payload }) => (
  <text x={x} y={y} dy={4} textAnchor="end" fontSize={12} fill="#6b7280">
    {payload.value.length > 22 ? payload.value.slice(0, 22) + '…' : payload.value}
  </text>
)

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.center}>Loading statistics…</div>
  if (error)   return <div className={styles.center} style={{ color: '#dc2626' }}>{error}</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>

      {/* Summary cards */}
      <div className={styles.cards}>
        <StatCard label="Total Certificates" value={stats.total.toLocaleString()} />
        <StatCard label="Issued This Month"  value={stats.issuedThisMonth.toLocaleString()} />
        <StatCard label="Award Levels"       value={stats.levelData.length} />
        <StatCard label="Organisations"      value={stats.orgData.length} sub="(top 10 shown)" />
      </div>

      <div className={styles.grid}>
        {/* By level */}
        <ChartCard title="Certificates by Level">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.levelData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip cursor={{ fill: '#f5f3ff' }} contentStyle={{ fontSize: 13, borderRadius: 6 }} />
              <Bar dataKey="count" name="Certificates" radius={[4, 4, 0, 0]}>
                {stats.levelData.map(entry => (
                  <Cell key={entry.name} fill={LEVEL_COLORS[entry.name] ?? DEFAULT_BAR_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly trend */}
        <ChartCard title="Issued Per Month (last 12 months)">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.monthData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip cursor={{ stroke: '#6366f1', strokeWidth: 1 }} contentStyle={{ fontSize: 13, borderRadius: 6 }} />
              <Area
                type="monotone"
                dataKey="count"
                name="Issued"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#monthGrad)"
                dot={{ r: 3, fill: '#6366f1' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top organisations */}
        <ChartCard title="Top Organisations">
          {stats.orgData.length === 0 ? (
            <p className={styles.empty}>No organisation data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, stats.orgData.length * 36)}>
              <BarChart
                layout="vertical"
                data={stats.orgData}
                margin={{ top: 4, right: 24, bottom: 0, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={150} tick={<OrgTick />} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f5f3ff' }} contentStyle={{ fontSize: 13, borderRadius: 6 }} />
                <Bar dataKey="count" name="Certificates" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
