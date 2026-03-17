// src/pages/PricingPage.jsx
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentApi } from '../lib/api'
import { useAuthStore } from '../context/authStore'
import { openRazorpayCheckout } from '../lib/razorpay'
import { CheckCircle2, Zap, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function PricingPage() {
  const { user, isAuthenticated, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ['plans'],
    queryFn: () => paymentApi.plans().then(r => r.data.data.plans),
  })

  const plans = data || []

  const handleUpgrade = async (planId) => {
    if (!isAuthenticated) { navigate('/register'); return }
    if (planId === 'FREE') return

    setLoading(planId)
    try {
      const { data: orderData } = await paymentApi.initiate(planId)
      const { orderId, amount, currency, keyId } = orderData.data

      openRazorpayCheckout({
        orderId, amount, currency, keyId,
        userName: user.name,
        userEmail: user.email,
        onSuccess: async ({ orderId: oid, paymentId, signature }) => {
          try {
            const { data: verifyData } = await paymentApi.verify({ orderId: oid, paymentId, signature, plan: planId })
            updateUser(verifyData.data.user)
            qc.invalidateQueries(['dashboard'])
            toast.success(`🎉 ${planId} plan activated!`)
            navigate('/dashboard')
          } catch {
            toast.error('Payment verified but activation failed. Please contact support.')
          }
        },
        onFailure: (msg) => {
          if (msg !== 'Payment cancelled') toast.error(msg || 'Payment failed')
        },
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        {isAuthenticated && (
          <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm mb-6">
            <ArrowLeft size={14} /> Back to dashboard
          </button>
        )}

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-brand-600 text-xs font-semibold bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-full mb-4">
            <Zap size={11} fill="currentColor" /> Simple pricing for every seller
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 mb-3">
            Choose your plan
          </h1>
          <p className="text-neutral-500 text-lg">All plans include 12 variants per image and AI background removal.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {(plans.length ? plans : [
            { id: 'FREE',      name: 'Free',      priceINR: '0',    period: '',      imagesLimit: '10',       features: ['12 variants per image','White BG removal','Shipping score','Email support'], highlight: false },
            { id: 'STARTER',   name: 'Starter',   priceINR: '499',  period: '/month',imagesLimit: '200',      features: ['12 variants per image','White BG removal','Shipping score','Bulk upload (5)','ZIP download'], highlight: false },
            { id: 'PRO',       name: 'Pro',       priceINR: '999',  period: '/month',imagesLimit: '1,000',    features: ['12 variants per image','White BG removal','Shipping score','Bulk upload (20)','ZIP download','Priority support'], highlight: true },
            { id: 'UNLIMITED', name: 'Unlimited', priceINR: '1,999',period: '/month',imagesLimit: 'Unlimited',features: ['12 variants per image','White BG removal','Shipping score','Bulk upload (20)','ZIP download','Priority support','API access'], highlight: false },
          ]).map((plan) => {
            const isCurrentPlan = user?.plan === plan.id
            return (
              <div key={plan.id} className={`card p-5 flex flex-col relative ${plan.highlight ? 'ring-2 ring-brand-400 shadow-lg' : ''}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      CURRENT PLAN
                    </span>
                  </div>
                )}

                <div className="mb-4 pt-2">
                  <h2 className="font-semibold text-neutral-900 text-lg">{plan.name}</h2>
                  <div className="mt-1">
                    <span className="text-3xl font-semibold text-neutral-900">₹{plan.priceINR}</span>
                    <span className="text-neutral-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1 font-medium">{plan.imagesLimit} images</p>
                </div>

                <div className="space-y-2 flex-1 mb-5">
                  {(plan.features || []).map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id || isCurrentPlan || plan.id === 'FREE'}
                  className={`w-full justify-center py-2.5 text-sm font-medium rounded-xl transition-all
                    ${plan.highlight
                      ? 'btn-primary'
                      : isCurrentPlan
                        ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                        : plan.id === 'FREE'
                          ? 'bg-neutral-100 text-neutral-500 cursor-default'
                          : 'btn-secondary'
                    }`}
                >
                  {loading === plan.id ? 'Processing...'
                    : isCurrentPlan ? '✓ Active'
                    : plan.id === 'FREE' ? 'Free plan'
                    : `Upgrade to ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* Guarantee */}
        <div className="text-center text-sm text-neutral-400">
          <p>Secure payments via Razorpay · All prices in INR · Plans renew monthly</p>
          <p className="mt-1">Questions? Email us at <a href="mailto:support@shipsmart.in" className="text-brand-600 hover:underline">support@shipsmart.in</a></p>
        </div>
      </div>
    </div>
  )
}
