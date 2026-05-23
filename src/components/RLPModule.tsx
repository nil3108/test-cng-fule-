import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, MapPin, Package, CheckCircle2, LogOut, Plus, X,
  AlertTriangle, ChevronRight, RotateCcw, Users, Navigation,
  ArrowRight, ClipboardList, Check, IndianRupee,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface RLPOwner {
  id: string; name: string; email: string; password: string
  business: string; phone: string; status: 'active' | 'inactive'; createdAt: string
}
interface RLPDriver {
  id: string; name: string; code: string; phone: string
  ownerId: string; status: 'active' | 'inactive'; createdAt: string
}
type LoadStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled'
type VehicleType = 'Tata Ace' | 'Tata Intra V20' | 'Ashok Leyland Dost' | 'Mini Truck' | 'Full Truck'
interface RLPLoad {
  id: string; ownerId: string; ownerName: string; ownerBusiness: string
  driverId?: string; driverName?: string
  pickup: string; drop: string
  weight: number; vehicleType: VehicleType; material: string; offeredRate: number
  status: LoadStatus; notes?: string
  createdAt: string; acceptedAt?: string; inTransitAt?: string; deliveredAt?: string
}

// ─────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────
const K = {
  OWNERS: 'rlp_owners', DRIVERS: 'rlp_drivers',
  LOADS: 'rlp_loads',   SESSION: 'rlp_session',
}

function initRLPDemo() {
  if (!localStorage.getItem(K.OWNERS)) {
    localStorage.setItem(K.OWNERS, JSON.stringify([
      { id: 'rlp_own1', name: 'Ramesh Shah', email: 'ramesh@demo.com', password: 'demo123',
        business: 'Shah Logistics', phone: '9876512345', status: 'active', createdAt: new Date().toISOString() },
    ] as RLPOwner[]))
  }
  if (!localStorage.getItem(K.DRIVERS)) {
    localStorage.setItem(K.DRIVERS, JSON.stringify([
      { id: 'rlp_drv1', name: 'Vijay Kumar',   code: '1111', phone: '9988776655', ownerId: 'rlp_own1', status: 'active', createdAt: new Date().toISOString() },
      { id: 'rlp_drv2', name: 'Priya Sharma',  code: '2222', phone: '9977665544', ownerId: 'rlp_own1', status: 'active', createdAt: new Date().toISOString() },
      { id: 'rlp_drv3', name: 'Mohan Patel',   code: '3333', phone: '9966554433', ownerId: 'rlp_own1', status: 'active', createdAt: new Date().toISOString() },
    ] as RLPDriver[]))
  }
  if (!localStorage.getItem(K.LOADS)) {
    const now = Date.now()
    localStorage.setItem(K.LOADS, JSON.stringify([
      { id: 'rlp_l1', ownerId: 'rlp_own1', ownerName: 'Ramesh Shah', ownerBusiness: 'Shah Logistics',
        driverId: 'rlp_drv1', driverName: 'Vijay Kumar',
        pickup: 'APMC Market, Ahmedabad', drop: 'Surat Textile Hub, Surat',
        weight: 1200, vehicleType: 'Tata Intra V20', material: 'Textile goods', offeredRate: 3500,
        status: 'in_transit', createdAt: new Date(now - 3600000).toISOString(),
        acceptedAt: new Date(now - 1800000).toISOString(), inTransitAt: new Date(now - 900000).toISOString() },
      { id: 'rlp_l2', ownerId: 'rlp_own1', ownerName: 'Ramesh Shah', ownerBusiness: 'Shah Logistics',
        pickup: 'Vatva GIDC, Ahmedabad', drop: 'Rajkot Industrial Area, Rajkot',
        weight: 800, vehicleType: 'Tata Ace', material: 'Auto parts', offeredRate: 2200,
        status: 'pending', createdAt: new Date(now - 1800000).toISOString() },
      { id: 'rlp_l3', ownerId: 'rlp_own1', ownerName: 'Ramesh Shah', ownerBusiness: 'Shah Logistics',
        driverId: 'rlp_drv2', driverName: 'Priya Sharma',
        pickup: 'Naroda, Ahmedabad', drop: 'Morbi Ceramic Zone, Morbi',
        weight: 2000, vehicleType: 'Mini Truck', material: 'Ceramic tiles', offeredRate: 4500,
        status: 'delivered', createdAt: new Date(now - 86400000).toISOString(),
        acceptedAt: new Date(now - 82800000).toISOString(),
        inTransitAt: new Date(now - 79200000).toISOString(),
        deliveredAt: new Date(now - 72000000).toISOString() },
      { id: 'rlp_l4', ownerId: 'rlp_own1', ownerName: 'Ramesh Shah', ownerBusiness: 'Shah Logistics',
        pickup: 'Odhav Industrial Estate, Ahmedabad', drop: 'Vadodara Akota, Vadodara',
        weight: 650, vehicleType: 'Tata Ace', material: 'Electrical fittings', offeredRate: 1800,
        notes: 'Handle with care — fragile items',
        status: 'pending', createdAt: new Date(now - 600000).toISOString() },
    ] as RLPLoad[]))
  }
}
initRLPDemo()

const rlpStore = {
  getOwners:  (): RLPOwner[]  => JSON.parse(localStorage.getItem(K.OWNERS)  || '[]'),
  saveOwners: (d: RLPOwner[])  => localStorage.setItem(K.OWNERS,  JSON.stringify(d)),
  getDrivers: (): RLPDriver[] => JSON.parse(localStorage.getItem(K.DRIVERS) || '[]'),
  saveDrivers:(d: RLPDriver[]) => localStorage.setItem(K.DRIVERS, JSON.stringify(d)),
  getLoads:   (): RLPLoad[]   => JSON.parse(localStorage.getItem(K.LOADS)   || '[]'),
  saveLoads:  (d: RLPLoad[])  => localStorage.setItem(K.LOADS,   JSON.stringify(d)),
  getSession: ()               => JSON.parse(localStorage.getItem(K.SESSION) || 'null'),
  setSession: (s: any)         => localStorage.setItem(K.SESSION, JSON.stringify(s)),
  clearSession:()              => localStorage.removeItem(K.SESSION),
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const STATUS_LABEL: Record<LoadStatus, string> = {
  pending: 'Pending', accepted: 'Accepted', in_transit: 'In Transit',
  delivered: 'Delivered', cancelled: 'Cancelled',
}
const STATUS_COLOR: Record<LoadStatus, string> = {
  pending:   'bg-[#FEF3C7] text-[#92400E]',
  accepted:  'bg-[#DBEAFE] text-[#1E40AF]',
  in_transit:'bg-[#FDE8E8] text-[#991B1B]',
  delivered: 'bg-[#DCFCE7] text-[#166534]',
  cancelled: 'bg-[#F3F4F6] text-[#6B7280]',
}

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

// ─────────────────────────────────────────────────────────
// Shared card components
// ─────────────────────────────────────────────────────────
function LoadCard({ load, onCancel }: { load: RLPLoad; onCancel?: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E6EB]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[load.status]}`}>
            {STATUS_LABEL[load.status]}
          </span>
          {load.driverName && (
            <span className="text-[11px] text-[#6B7280]">· {load.driverName}</span>
          )}
        </div>
        <span className="text-[11px] text-[#9CA3AF] flex-shrink-0 ml-2">{timeAgo(load.createdAt)}</span>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <p className="text-[13px] font-medium text-[#111827] truncate">{load.pickup}</p>
        </div>
        <div className="ml-[3px] w-px h-3 bg-[#E2E6EB]" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <p className="text-[13px] font-medium text-[#111827] truncate">{load.drop}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-[#F3F4F6] flex-wrap">
        <span className="text-[12px] text-[#6B7280]">{load.material}</span>
        <span className="text-[#E2E6EB]">·</span>
        <span className="text-[12px] text-[#6B7280]">{load.weight} kg</span>
        <span className="text-[#E2E6EB]">·</span>
        <span className="text-[12px] font-semibold text-[#111827]">₹{load.offeredRate.toLocaleString('en-IN')}</span>
        {onCancel && (
          <button onClick={onCancel}
            className="ml-auto flex items-center gap-1 text-[11px] text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
            <X className="w-3 h-3" /> Cancel
          </button>
        )}
      </div>
    </div>
  )
}

function DriverLoadCard({ load, onAccept }: { load: RLPLoad; onAccept?: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2E6EB]">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <p className="text-[14px] font-semibold text-[#111827] truncate">{load.pickup}</p>
          </div>
          <div className="ml-[3px] w-px h-3 bg-[#E2E6EB]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <p className="text-[14px] font-semibold text-[#111827] truncate">{load.drop}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[20px] font-bold text-[#2563EB]">₹{load.offeredRate.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#9CA3AF]">{timeAgo(load.createdAt)}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        <span className="text-[11px] bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded-full">{load.vehicleType}</span>
        <span className="text-[11px] bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded-full">{load.weight} kg</span>
        <span className="text-[11px] bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded-full">{load.material}</span>
      </div>

      {load.notes && (
        <p className="text-[12px] text-[#6B7280] mb-3 bg-[#FFFBEB] rounded-xl p-2.5 border border-[#FDE68A]">
          <span className="mr-1">Note:</span> {load.notes}
        </p>
      )}

      {onAccept && (
        <button onClick={onAccept}
          className="w-full h-[44px] bg-[#2563EB] text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-[14px] hover:bg-[#1d4ed8] transition-colors">
          <CheckCircle2 className="w-4 h-4" /> Accept Load
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────
type RLPView = 'welcome' | 'owner-login' | 'driver-login' | 'owner-dash' | 'driver-dash'

export function RLPModule({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<RLPView>('welcome')
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const saved = rlpStore.getSession()
    if (saved) {
      setSession(saved)
      setView(saved.role === 'owner' ? 'owner-dash' : 'driver-dash')
    }
  }, [])

  const logout = () => { rlpStore.clearSession(); setSession(null); setView('welcome') }

  return (
    <div className="min-h-screen bg-[#F0F4FF] text-[#111827] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E6EB]">
        <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onBack}
              className="w-8 h-8 rounded-lg bg-[#F0F4FF] flex items-center justify-center hover:bg-[#DBEAFE] transition-colors mr-1"
              aria-label="Back to home">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-[12px] font-black tracking-tight text-[#111827] uppercase leading-none">Reverse Load</p>
              <p className="text-[9px] font-semibold tracking-widest text-[#6B7280] uppercase">Pick Up</p>
            </div>
          </div>
          {session && (
            <button onClick={logout} className="p-2 hover:bg-[#F0F4FF] rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-[#6B7280]" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-[480px] w-full mx-auto">
        <AnimatePresence mode="wait">
          {view === 'welcome'     && <RLPWelcome    key="rlp-welcome"     setView={setView} />}
          {view === 'owner-login' && <RLPOwnerLogin key="rlp-owner-login" setView={setView} setSession={setSession} />}
          {view === 'driver-login'&& <RLPDriverLogin key="rlp-drv-login"  setView={setView} setSession={setSession} />}
          {view === 'owner-dash'  && <RLPOwnerDash  key="rlp-owner-dash"  session={session} logout={logout} />}
          {view === 'driver-dash' && <RLPDriverDash key="rlp-drv-dash"    session={session} logout={logout} />}
        </AnimatePresence>
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Welcome
// ─────────────────────────────────────────────────────────
function RLPWelcome({ setView }: { setView: (v: RLPView) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="p-6 pt-8 flex flex-col min-h-[calc(100vh-3.5rem)]">
      <div className="text-center mb-10">
        <div className="w-24 h-24 mx-auto mb-5 rounded-3xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-[#2563EB]/30">
          <Truck className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-[24px] font-black tracking-tight text-[#111827] uppercase">Reverse Load</h1>
        <p className="text-[11px] font-bold tracking-[0.25em] text-[#6B7280] uppercase mb-2">Pick Up System</p>
        <p className="text-[14px] text-[#6B7280] px-6">Efficient load dispatch & real-time delivery tracking</p>
      </div>

      <div className="space-y-3">
        {/* Driver */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setView('driver-login')} className="w-full">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25 hover:brightness-110 transition-all">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-[18px]">Driver</div>
              <div className="text-[13px] text-white/75">View &amp; accept available loads</div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50" />
          </div>
        </motion.button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E2E6EB]" />
          <p className="text-[12px] text-[#9CA3AF]">or</p>
          <div className="flex-1 h-px bg-[#E2E6EB]" />
        </div>

        {/* Dispatcher */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setView('owner-login')} className="w-full">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E2E6EB] hover:border-[#BFDBFE] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
              <Users className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-[18px] text-[#111827]">Dispatcher / Owner</div>
              <div className="text-[13px] text-[#6B7280]">Post &amp; manage loads</div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
          </div>
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
// Owner Login
// ─────────────────────────────────────────────────────────
function RLPOwnerLogin({ setView, setSession }: { setView: (v: RLPView) => void; setSession: (s: any) => void }) {
  const [email, setEmail] = useState('ramesh@demo.com')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState('')

  const login = () => {
    const owner = rlpStore.getOwners().find(o => o.email === email.trim().toLowerCase() && o.password === password)
    if (!owner) { setError('Invalid email or password'); return }
    const sess = { role: 'owner', userId: owner.id, name: owner.name, business: owner.business }
    rlpStore.setSession(sess); setSession(sess); setView('owner-dash')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="p-6 pt-8">
      <button onClick={() => setView('welcome')} className="text-[#6B7280] mb-6 block text-[14px]">← Back</button>
      <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center mb-4">
        <Users className="w-7 h-7 text-[#2563EB]" />
      </div>
      <h2 className="text-[22px] font-bold mb-1 text-[#111827]">Dispatcher Login</h2>
      <p className="text-[14px] text-[#6B7280] mb-6">Sign in to manage loads and drivers</p>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px]">{error}</div>}

      <div className="space-y-3">
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
          placeholder="Email address"
          className="w-full h-[52px] px-4 bg-white border border-[#E2E6EB] rounded-xl text-[15px] focus:border-[#2563EB] focus:outline-none" />
        <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError('') }}
          placeholder="Password"
          className="w-full h-[52px] px-4 bg-white border border-[#E2E6EB] rounded-xl text-[15px] focus:border-[#2563EB] focus:outline-none" />
        <button onClick={login}
          className="w-full h-[52px] bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1d4ed8] transition-colors">
          Sign In
        </button>
      </div>
      <p className="text-center text-[12px] text-[#9CA3AF] mt-5">Demo: ramesh@demo.com / demo123</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
// Driver Login
// ─────────────────────────────────────────────────────────
function RLPDriverLogin({ setView, setSession }: { setView: (v: RLPView) => void; setSession: (s: any) => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const login = () => {
    const driver = rlpStore.getDrivers().find(d => d.code === code && d.status === 'active')
    if (!driver) { setError('Invalid code. Please try again.'); return }
    const sess = { role: 'driver', userId: driver.id, name: driver.name, ownerId: driver.ownerId }
    rlpStore.setSession(sess); setSession(sess); setView('driver-dash')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="p-6 pt-8">
      <button onClick={() => setView('welcome')} className="text-[#6B7280] mb-6 block text-[14px]">← Back</button>
      <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center mb-4">
        <Truck className="w-7 h-7 text-[#2563EB]" />
      </div>
      <h2 className="text-[22px] font-bold mb-1 text-[#111827]">Driver Login</h2>
      <p className="text-[14px] text-[#6B7280] mb-6">Enter your 4-digit driver code</p>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px]">{error}</div>}

      <input type="tel" inputMode="numeric" value={code}
        onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
        placeholder="• • • •"
        className="w-full h-[64px] bg-white border-2 border-[#E2E6EB] rounded-2xl text-center text-[32px] font-mono tracking-[0.5em] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:outline-none transition-all mb-4"
      />
      <button onClick={login} disabled={code.length !== 4}
        className="w-full h-[52px] bg-[#2563EB] text-white font-semibold rounded-xl disabled:opacity-40 transition-colors">
        Enter
      </button>
      <p className="text-center text-[12px] text-[#9CA3AF] mt-5">Demo codes: 1111 · 2222 · 3333</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────
// Owner / Dispatcher Dashboard
// ─────────────────────────────────────────────────────────
type OwnerTab = 'home' | 'post' | 'active' | 'history' | 'drivers'

function RLPOwnerDash({ session, logout }: { session: any; logout: () => void }) {
  const [tab, setTab] = useState<OwnerTab>('home')
  const [loads, setLoads] = useState<RLPLoad[]>([])
  const [drivers, setDrivers] = useState<RLPDriver[]>([])
  const reload = () => { setLoads(rlpStore.getLoads()); setDrivers(rlpStore.getDrivers()) }
  useEffect(() => { reload() }, [])

  const myLoads    = loads.filter(l => l.ownerId === session.userId)
  const pending    = myLoads.filter(l => l.status === 'pending')
  const active     = myLoads.filter(l => ['accepted','in_transit'].includes(l.status))
  const delivered  = myLoads.filter(l => l.status === 'delivered')
  const myDrivers  = drivers.filter(d => d.ownerId === session.userId && d.status === 'active')

  // ── Post form ──
  const blankForm = { pickup: '', drop: '', material: '', weight: '', vehicleType: 'Tata Ace' as VehicleType, offeredRate: '', notes: '' }
  const [form, setForm] = useState(blankForm)
  const [posting, setPosting] = useState(false)

  const postLoad = () => {
    if (!form.pickup || !form.drop || !form.material || !form.weight || !form.offeredRate) return
    setPosting(true)
    const load: RLPLoad = {
      id: 'rlp_' + Date.now(), ownerId: session.userId,
      ownerName: session.name, ownerBusiness: session.business,
      pickup: form.pickup.trim(), drop: form.drop.trim(),
      material: form.material.trim(), weight: parseFloat(form.weight),
      vehicleType: form.vehicleType, offeredRate: parseFloat(form.offeredRate),
      notes: form.notes.trim() || undefined,
      status: 'pending', createdAt: new Date().toISOString(),
    }
    rlpStore.saveLoads([...rlpStore.getLoads(), load])
    setForm(blankForm); setPosting(false); reload(); setTab('active')
  }

  const cancelLoad = (id: string) => {
    rlpStore.saveLoads(rlpStore.getLoads().map(l => l.id === id ? { ...l, status: 'cancelled' as LoadStatus } : l))
    reload()
  }

  // ── Add driver form ──
  const [drvForm, setDrvForm] = useState({ name: '', code: '', phone: '' })
  const [addingDrv, setAddingDrv] = useState(false)

  const addDriver = () => {
    if (!drvForm.name || drvForm.code.length !== 4) return
    if (rlpStore.getDrivers().find(d => d.code === drvForm.code)) { alert('Code already in use'); return }
    const drv: RLPDriver = {
      id: 'rlp_drv' + Date.now(), name: drvForm.name.trim(),
      code: drvForm.code, phone: drvForm.phone.trim(),
      ownerId: session.userId, status: 'active', createdAt: new Date().toISOString(),
    }
    rlpStore.saveDrivers([...rlpStore.getDrivers(), drv])
    setDrvForm({ name: '', code: '', phone: '' }); setAddingDrv(false); reload()
  }

  const removeDriver = (id: string) => {
    if (!window.confirm('Remove this driver?')) return
    rlpStore.saveDrivers(rlpStore.getDrivers().map(d => d.id === id ? { ...d, status: 'inactive' as const } : d))
    reload()
  }

  const VEHICLE_TYPES: VehicleType[] = ['Tata Ace', 'Tata Intra V20', 'Ashok Leyland Dost', 'Mini Truck', 'Full Truck']
  const activeTotal = [...pending, ...active].length

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pb-24">
      <div className="p-4 pb-2">
        <p className="font-bold text-[18px] text-[#111827]">{session.business}</p>
        <p className="text-[13px] text-[#6B7280]">{session.name}</p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── HOME ── */}
        {tab === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Pending',   value: pending.length,   color: 'text-[#F59E0B]' },
                { label: 'Active',    value: active.length,    color: 'text-[#2563EB]' },
                { label: 'Delivered', value: delivered.length, color: 'text-[#10B981]' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-2xl p-3 text-center border border-[#E2E6EB]">
                  <p className={`text-[26px] font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-[11px] text-[#6B7280]">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#2563EB] rounded-2xl p-5 text-white">
              <p className="text-[13px] text-white/70 mb-1">Total Earnings (Delivered)</p>
              <p className="text-[30px] font-bold">₹{delivered.reduce((s, l) => s + l.offeredRate, 0).toLocaleString('en-IN')}</p>
            </div>

            {/* Quick post button */}
            <button onClick={() => setTab('post')}
              className="w-full h-[52px] border-2 border-dashed border-[#BFDBFE] rounded-2xl text-[#2563EB] font-semibold flex items-center justify-center gap-2 hover:bg-[#EFF6FF] transition-colors">
              <Plus className="w-5 h-5" /> Post a New Load
            </button>

            {activeTotal > 0 && (
              <>
                <p className="font-semibold text-[14px] text-[#111827]">Active Loads</p>
                {[...pending, ...active].slice(0, 3).map(l => (
                  <LoadCard key={l.id} load={l} onCancel={l.status === 'pending' ? () => cancelLoad(l.id) : undefined} />
                ))}
              </>
            )}
            {activeTotal === 0 && (
              <div className="text-center py-10 text-[#9CA3AF] text-[14px]">
                No active loads. Tap "Post a New Load" above.
              </div>
            )}
          </motion.div>
        )}

        {/* ── POST LOAD ── */}
        {tab === 'post' && (
          <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
            <h3 className="font-bold text-[18px] text-[#111827]">Post New Load</h3>
            <div className="bg-white rounded-2xl p-4 space-y-3 border border-[#E2E6EB]">
              {[
                { key: 'pickup',   label: 'Pickup Location *', placeholder: 'e.g. APMC Market, Ahmedabad' },
                { key: 'drop',     label: 'Drop Location *',   placeholder: 'e.g. Surat Textile Hub, Surat' },
                { key: 'material', label: 'Material *',        placeholder: 'e.g. Textile goods, Auto parts' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[11px] text-[#6B7280] uppercase tracking-wider mb-1 block">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full h-[48px] px-3 border border-[#E2E6EB] rounded-xl text-[14px] focus:border-[#2563EB] focus:outline-none" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-[#6B7280] uppercase tracking-wider mb-1 block">Weight (kg) *</label>
                  <input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
                    placeholder="e.g. 800"
                    className="w-full h-[48px] px-3 border border-[#E2E6EB] rounded-xl text-[14px] font-mono text-center focus:border-[#2563EB] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] text-[#6B7280] uppercase tracking-wider mb-1 block">Rate (₹) *</label>
                  <input type="number" value={form.offeredRate} onChange={e => setForm(p => ({ ...p, offeredRate: e.target.value }))}
                    placeholder="e.g. 2200"
                    className="w-full h-[48px] px-3 border border-[#E2E6EB] rounded-xl text-[14px] font-mono text-center focus:border-[#2563EB] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#6B7280] uppercase tracking-wider mb-1 block">Vehicle Type *</label>
                <select value={form.vehicleType} onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value as VehicleType }))}
                  className="w-full h-[48px] px-3 border border-[#E2E6EB] rounded-xl text-[14px] focus:border-[#2563EB] focus:outline-none bg-white">
                  {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#6B7280] uppercase tracking-wider mb-1 block">Notes (optional)</label>
                <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Special instructions, fragile items, etc."
                  className="w-full h-[48px] px-3 border border-[#E2E6EB] rounded-xl text-[14px] focus:border-[#2563EB] focus:outline-none" />
              </div>

              <button onClick={postLoad}
                disabled={!form.pickup || !form.drop || !form.material || !form.weight || !form.offeredRate || posting}
                className="w-full h-[52px] bg-[#2563EB] text-white font-semibold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#1d4ed8] transition-colors">
                {posting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
                Post Load
              </button>
            </div>
          </motion.div>
        )}

        {/* ── ACTIVE LOADS ── */}
        {tab === 'active' && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
            <h3 className="font-bold text-[18px] text-[#111827]">Active Loads</h3>
            {activeTotal === 0
              ? <div className="text-center py-12 text-[#9CA3AF] text-[14px]">No active loads right now</div>
              : [...pending, ...active].map(l => (
                  <LoadCard key={l.id} load={l} onCancel={l.status === 'pending' ? () => cancelLoad(l.id) : undefined} />
                ))
            }
          </motion.div>
        )}

        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
            <h3 className="font-bold text-[18px] text-[#111827]">History</h3>
            {myLoads.filter(l => ['delivered','cancelled'].includes(l.status)).length === 0
              ? <div className="text-center py-12 text-[#9CA3AF] text-[14px]">No completed loads yet</div>
              : myLoads
                  .filter(l => ['delivered','cancelled'].includes(l.status))
                  .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(l => <LoadCard key={l.id} load={l} />)
            }
          </motion.div>
        )}

        {/* ── DRIVERS ── */}
        {tab === 'drivers' && (
          <motion.div key="drivers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[18px] text-[#111827]">Drivers ({myDrivers.length})</h3>
              <button onClick={() => setAddingDrv(!addingDrv)}
                className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-[#2563EB] text-white text-[13px] font-medium">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {addingDrv && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 space-y-3 border border-[#BFDBFE]">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[#6B7280] uppercase tracking-wider mb-1 block">Name *</label>
                    <input value={drvForm.name} onChange={e => setDrvForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Driver name"
                      className="w-full h-[44px] px-3 border border-[#E2E6EB] rounded-xl text-[14px] focus:border-[#2563EB] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#6B7280] uppercase tracking-wider mb-1 block">4-Digit Code *</label>
                    <input type="tel" inputMode="numeric" value={drvForm.code}
                      onChange={e => setDrvForm(p => ({ ...p, code: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                      placeholder="e.g. 4444"
                      className="w-full h-[44px] px-3 border border-[#E2E6EB] rounded-xl text-[14px] font-mono text-center focus:border-[#2563EB] focus:outline-none" />
                  </div>
                </div>
                <input value={drvForm.phone} onChange={e => setDrvForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="Phone number (optional)"
                  className="w-full h-[44px] px-3 border border-[#E2E6EB] rounded-xl text-[14px] focus:border-[#2563EB] focus:outline-none" />
                <div className="flex gap-2">
                  <button onClick={() => { setAddingDrv(false); setDrvForm({ name:'', code:'', phone:'' }) }}
                    className="flex-1 h-[44px] rounded-xl bg-[#F5F6F8] text-[#6B7280] text-[14px] font-medium">Cancel</button>
                  <button onClick={addDriver} disabled={!drvForm.name || drvForm.code.length !== 4}
                    className="flex-1 h-[44px] rounded-xl bg-[#2563EB] text-white text-[14px] font-semibold disabled:opacity-40">Add Driver</button>
                </div>
              </motion.div>
            )}

            {myDrivers.length === 0 && !addingDrv && (
              <div className="text-center py-10 text-[#9CA3AF] text-[14px]">No drivers yet. Add your first driver.</div>
            )}

            {myDrivers.map(d => {
              const activeLoad = loads.find(l => l.driverId === d.id && ['accepted','in_transit'].includes(l.status))
              return (
                <div key={d.id} className="bg-white rounded-2xl p-4 border border-[#E2E6EB] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] text-[#111827]">{d.name}</p>
                    <p className="text-[12px] text-[#6B7280]">Code: {d.code}{d.phone ? ` · ${d.phone}` : ''}</p>
                    {activeLoad && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLOR[activeLoad.status]}`}>
                        {STATUS_LABEL[activeLoad.status]}
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeDriver(d.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E6EB]">
        <div className="max-w-[480px] mx-auto flex">
          {([
            { key: 'home',    Icon: Package,       label: 'Home' },
            { key: 'post',    Icon: Plus,          label: 'Post' },
            { key: 'active',  Icon: Truck,         label: `Active${activeTotal > 0 ? ` (${activeTotal})` : ''}` },
            { key: 'history', Icon: ClipboardList, label: 'History' },
            { key: 'drivers', Icon: Users,         label: 'Drivers' },
          ] as const).map(item => (
            <button key={item.key} onClick={() => setTab(item.key as OwnerTab)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${tab === item.key ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`}>
              <item.Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Driver Dashboard
// ─────────────────────────────────────────────────────────
type DriverTab = 'available' | 'my-load' | 'history'

function RLPDriverDash({ session, logout }: { session: any; logout: () => void }) {
  const [tab, setTab] = useState<DriverTab>('available')
  const [loads, setLoads] = useState<RLPLoad[]>([])
  const reload = () => setLoads(rlpStore.getLoads())
  useEffect(() => { reload() }, [])

  const ownerLoads    = loads.filter(l => l.ownerId === session.ownerId)
  const available     = ownerLoads.filter(l => l.status === 'pending')
  const myActiveLoad  = ownerLoads.find(l => l.driverId === session.userId && ['accepted','in_transit'].includes(l.status))
  const myHistory     = ownerLoads.filter(l => l.driverId === session.userId && l.status === 'delivered')
    .sort((a,b) => new Date(b.deliveredAt!).getTime() - new Date(a.deliveredAt!).getTime())

  const acceptLoad = (id: string) => {
    if (myActiveLoad) { alert('Deliver your current load first.'); return }
    rlpStore.saveLoads(rlpStore.getLoads().map(l => l.id === id
      ? { ...l, status: 'accepted' as LoadStatus, driverId: session.userId, driverName: session.name, acceptedAt: new Date().toISOString() }
      : l))
    reload(); setTab('my-load')
  }

  const updateStatus = (next: LoadStatus) => {
    if (!myActiveLoad) return
    const ts: Partial<RLPLoad> = next === 'in_transit'
      ? { status: next, inTransitAt: new Date().toISOString() }
      : { status: next, deliveredAt: new Date().toISOString() }
    rlpStore.saveLoads(rlpStore.getLoads().map(l => l.id === myActiveLoad.id ? { ...l, ...ts } : l))
    reload()
    if (next === 'delivered') setTab('available')
  }

  const STEPS: LoadStatus[] = ['accepted', 'in_transit', 'delivered']
  const stepIdx = myActiveLoad ? STEPS.indexOf(myActiveLoad.status) : -1

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pb-24">
      <div className="p-4 pb-2">
        <p className="font-bold text-[18px] text-[#111827]">{session.name}</p>
        <p className="text-[13px] text-[#6B7280]">Driver · Reverse Load Pick Up</p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── AVAILABLE ── */}
        {tab === 'available' && (
          <motion.div key="avail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[18px] text-[#111827]">Available Loads</h3>
              <span className="text-[12px] text-[#6B7280]">{available.length} loads</span>
            </div>

            {myActiveLoad && (
              <div className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#1E40AF] flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#1E40AF]">
                  You have an <strong>active load</strong>. Deliver it before accepting a new one.
                  <button onClick={() => setTab('my-load')} className="ml-1 underline font-semibold">View it →</button>
                </p>
              </div>
            )}

            {available.length === 0
              ? <div className="text-center py-12 text-[#9CA3AF] text-[14px]">No loads available right now.<br/>Check back soon.</div>
              : available.map(l => (
                  <DriverLoadCard key={l.id} load={l} onAccept={!myActiveLoad ? () => acceptLoad(l.id) : undefined} />
                ))
            }
          </motion.div>
        )}

        {/* ── MY LOAD ── */}
        {tab === 'my-load' && (
          <motion.div key="myload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
            <h3 className="font-bold text-[18px] text-[#111827]">My Current Load</h3>

            {!myActiveLoad ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-10 h-10 text-[#D1D5DB]" />
                </div>
                <p className="text-[#9CA3AF] text-[14px]">No active load.</p>
                <button onClick={() => setTab('available')} className="mt-3 text-[#2563EB] text-[14px] font-semibold">
                  Browse Available Loads →
                </button>
              </div>
            ) : (
              <>
                {/* Progress timeline */}
                <div className="bg-white rounded-2xl p-5 border border-[#E2E6EB] space-y-4">
                  <div className="flex items-center">
                    {STEPS.map((s, i) => (
                      <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 transition-all ${
                          i < stepIdx ? 'bg-[#10B981] text-white'
                          : i === stepIdx ? 'bg-[#2563EB] text-white ring-4 ring-[#BFDBFE]'
                          : 'bg-[#F3F4F6] text-[#9CA3AF]'
                        }`}>
                          {i < stepIdx ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`flex-1 h-1 mx-1 rounded-full transition-all ${i < stepIdx ? 'bg-[#10B981]' : 'bg-[#F3F4F6]'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[11px] text-[#6B7280]">
                    <span>Accepted</span><span className="text-center">In Transit</span><span className="text-right">Delivered</span>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ${STATUS_COLOR[myActiveLoad.status]}`}>
                    {STATUS_LABEL[myActiveLoad.status]}
                  </span>

                  {/* Route */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[#6B7280] uppercase tracking-wider">Pickup</p>
                        <p className="font-semibold text-[14px] text-[#111827]">{myActiveLoad.pickup}</p>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2 text-[#9CA3AF]">
                      <div className="flex-1 border-t border-dashed border-[#E2E6EB]" />
                      <ArrowRight className="w-4 h-4" />
                      <div className="flex-1 border-t border-dashed border-[#E2E6EB]" />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[#6B7280] uppercase tracking-wider">Drop</p>
                        <p className="font-semibold text-[14px] text-[#111827]">{myActiveLoad.drop}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F3F4F6]">
                    {[
                      { label: 'Material', value: myActiveLoad.material },
                      { label: 'Weight',   value: `${myActiveLoad.weight} kg` },
                      { label: 'Your Rate',value: `₹${myActiveLoad.offeredRate.toLocaleString('en-IN')}` },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">{s.label}</p>
                        <p className="font-semibold text-[13px] text-[#111827] mt-0.5">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {myActiveLoad.notes && (
                    <p className="text-[12px] text-[#6B7280] bg-[#FFFBEB] rounded-xl p-3 border border-[#FDE68A]">
                      <span className="mr-1">Note:</span> {myActiveLoad.notes}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                {myActiveLoad.status === 'accepted' && (
                  <button onClick={() => updateStatus('in_transit')}
                    className="w-full h-[56px] bg-[#2563EB] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#2563EB]/25">
                    <Truck className="w-5 h-5" />
                    Mark as Picked Up / In Transit
                  </button>
                )}
                {myActiveLoad.status === 'in_transit' && (
                  <button onClick={() => updateStatus('delivered')}
                    className="w-full h-[56px] bg-[#10B981] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/25">
                    <CheckCircle2 className="w-5 h-5" />
                    Mark as Delivered ✓
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <motion.div key="hist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
            <h3 className="font-bold text-[18px] text-[#111827]">My Deliveries</h3>
            {myHistory.length === 0
              ? <div className="text-center py-12 text-[#9CA3AF] text-[14px]">No completed deliveries yet.</div>
              : myHistory.map(l => <LoadCard key={l.id} load={l} />)
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E6EB]">
        <div className="max-w-[480px] mx-auto flex">
          {([
            { key: 'available', Icon: Package,      label: `Available${available.length > 0 ? ` (${available.length})` : ''}` },
            { key: 'my-load',   Icon: Truck,        label: myActiveLoad ? 'My Load' : 'My Load' },
            { key: 'history',   Icon: ClipboardList,label: 'History' },
          ] as const).map(item => (
            <button key={item.key} onClick={() => setTab(item.key as DriverTab)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${tab === item.key ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`}>
              <item.Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
