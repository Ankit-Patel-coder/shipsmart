// src/pages/ProfilePage.jsx
import { useState } from 'react'
import { useAuthStore } from '../context/authStore'
import { userApi, paymentApi } from '../lib/api'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { User, Lock, CreditCard, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

function Section({ title, children }) {
  return (
    <div className="card p-6">
      <h2 className="font-semibold text-neutral-900 mb-5">{title}</h2>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.profile().then(r => r.data.data),
  })
  const { data: historyData } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => paymentApi.history().then(r => r.data.data),
  })

  const handleSaveName = async () => {
    if (!name.trim() || name === user?.name) return
    setSavingName(true)
    try {
      const { data } = await userApi.updateProfile({ name: name.trim() })
      updateUser(data.data.user)
      toast.success('Name updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSavingName(false)
    }
  }

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.newPassword.length < 8) { toast.error('Password must be 8+ characters'); return }
    setSavingPw(true)
    try {
      await userApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed')
    } finally {
      setSavingPw(false)
    }
  }

  const PLAN_LABELS = { FREE: 'Free', STARTER: 'Starter', PRO: 'Pro', UNLIMITED: 'Unlimited' }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-semibold text-neutral-900">Profile & Settings</h1>

      {/* Profile info */}
      <Section title="Account details">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-semibold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-neutral-900">{user?.name}</p>
            <p className="text-sm text-neutral-500">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <div className="flex gap-2">
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              <button onClick={handleSaveName} disabled={savingName || name === user?.name || !name.trim()} className="btn-primary text-sm px-4 whitespace-nowrap">
                {savingName ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-neutral-50 cursor-not-allowed" value={user?.email} disabled />
          </div>
        </div>
      </Section>

      {/* Subscription */}
      <Section title="Subscription">
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-neutral-900">{PLAN_LABELS[user?.plan] || 'Free'} Plan</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user?.plan === 'FREE' ? 'bg-neutral-200 text-neutral-600' :
                user?.plan === 'PRO' ? 'bg-purple-100 text-purple-700' :
                user?.plan === 'UNLIMITED' ? 'bg-brand-100 text-brand-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.plan}
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              {user?.imagesUsed} / {user?.imagesLimit === -1 ? '∞' : user?.imagesLimit} images used
            </p>
          </div>
          {user?.plan === 'FREE' && (
            <Link to="/pricing" className="btn-primary text-sm">
              Upgrade <ChevronRight size={13} />
            </Link>
          )}
        </div>

        {/* Payment history */}
        {historyData?.subscriptions?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-neutral-700 mb-2">Payment history</p>
            <div className="space-y-2">
              {historyData.subscriptions.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between text-sm py-2 border-b border-neutral-50 last:border-0">
                  <div>
                    <span className="font-medium text-neutral-800">{PLAN_LABELS[sub.plan]} Plan</span>
                    <span className="text-neutral-400 ml-2 text-xs">{new Date(sub.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-neutral-700">₹{(sub.amount / 100).toFixed(0)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      sub.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                      sub.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-neutral-100 text-neutral-500'
                    }`}>{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Change password */}
      <Section title="Change password">
        <div className="space-y-3">
          <div>
            <label className="label">Current password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">New password</label>
            <input className="input" type="password" placeholder="Min. 8 characters"
              value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input className="input" type="password" placeholder="Repeat password"
              value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
          </div>
          <button onClick={handleChangePassword} disabled={savingPw || !pwForm.currentPassword || !pwForm.newPassword}
            className="btn-primary text-sm">
            {savingPw ? 'Changing...' : 'Change password'}
          </button>
        </div>
      </Section>
    </div>
  )
}
