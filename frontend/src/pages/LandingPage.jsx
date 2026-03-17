// src/pages/LandingPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, CheckCircle2, TrendingDown, Shield, Star } from 'lucide-react'
import { motion } from 'framer-motion'

const FEATURES = [
  { icon: Zap,          title: '12 variants instantly',      desc: 'Get 12 shipping-optimised versions of your product image in under 60 seconds.' },
  { icon: TrendingDown, title: 'Lower shipping charges',     desc: 'White-BG, square 1080×1080 images reduce Meesho\'s volumetric weight estimate.' },
  { icon: Shield,       title: 'AI background removal',      desc: 'Remove messy backgrounds automatically — get a clean white studio look every time.' },
  { icon: Shield,       title: 'Meesho spec compliant',      desc: 'Every variant follows Meesho\'s latest listing guidelines out of the box.' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma',  role: 'Saree seller, Surat',      text: 'Shipping charges dropped by ₹18 per order after switching to ShipSmart images. Huge difference on 200+ orders a month!', rating: 5 },
  { name: 'Rajan Mehta',   role: 'Electronics, Ahmedabad',   text: 'Background removal is flawless. My listings look professional and I\'m saving 3-4 hours of editing work every week.', rating: 5 },
  { name: 'Divya Nair',    role: 'Handicrafts seller, Pune', text: 'Bulk upload is a game-changer. I upload 10 products, get 120 images back in minutes. Absolutely love this tool.', rating: 5 },
]

const PLANS = [
  { id: 'FREE',      name: 'Free',      price: '₹0',    period: '',       credits: '10 credits',        sub: 'One-time free allowance', highlight: false },
  { id: 'STARTER',   name: 'Starter',   price: '₹499',  period: '/month', credits: '200 credits/month', sub: '~16 products per day',     highlight: false },
  { id: 'PRO',       name: 'Pro',       price: '₹999',  period: '/month', credits: '1,000 credits/month',sub: '~33 products per day',    highlight: true },
  { id: 'UNLIMITED', name: 'Unlimited', price: '₹1,999',period: '/month', credits: 'Unlimited credits', sub: 'No daily limit',           highlight: false },
]

// Inline SVG product silhouettes — white bg product image feel
function ProductShape({ shape }) {
  const props = { width: '100%', height: '100%', viewBox: '0 0 80 80', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }
  const shapes = {
    bow: (
      <svg {...props}>
        <ellipse cx="30" cy="40" rx="20" ry="13" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5"/>
        <ellipse cx="50" cy="40" rx="20" ry="13" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5"/>
        <circle cx="40" cy="40" r="6" fill="#e0e0e0" stroke="#c8c8c8" strokeWidth="1.5"/>
        <line x1="34" y1="50" x2="30" y2="65" stroke="#d0d0d0" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="46" y1="50" x2="50" y2="65" stroke="#d0d0d0" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    tshirt: (
      <svg {...props}>
        <path d="M20 20 L10 35 L22 37 L22 62 L58 62 L58 37 L70 35 L60 20 L52 28 C50 22 46 18 40 18 C34 18 30 22 28 28 Z" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    bag: (
      <svg {...props}>
        <rect x="18" y="30" width="44" height="38" rx="4" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5"/>
        <path d="M28 30 C28 22 52 22 52 30" stroke="#d0d0d0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <rect x="32" y="42" width="16" height="8" rx="2" fill="#e0e0e0" stroke="#c8c8c8" strokeWidth="1"/>
      </svg>
    ),
    watch: (
      <svg {...props}>
        <rect x="32" y="12" width="16" height="12" rx="2" fill="#e0e0e0" stroke="#c8c8c8" strokeWidth="1.2"/>
        <rect x="32" y="56" width="16" height="12" rx="2" fill="#e0e0e0" stroke="#c8c8c8" strokeWidth="1.2"/>
        <circle cx="40" cy="40" r="16" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5"/>
        <circle cx="40" cy="40" r="11" fill="white" stroke="#e0e0e0" strokeWidth="1"/>
        <line x1="40" y1="34" x2="40" y2="40" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="40" y1="40" x2="45" y2="43" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    earring: (
      <svg {...props}>
        <circle cx="28" cy="22" r="4" fill="#e0e0e0" stroke="#c8c8c8" strokeWidth="1.2"/>
        <path d="M28 26 Q20 40 24 54 Q28 64 28 64" stroke="#d0d0d0" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <circle cx="52" cy="22" r="4" fill="#e0e0e0" stroke="#c8c8c8" strokeWidth="1.2"/>
        <path d="M52 26 Q44 40 48 54 Q52 64 52 64" stroke="#d0d0d0" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    kurta: (
      <svg {...props}>
        <path d="M25 15 L15 30 L25 32 L25 68 L55 68 L55 32 L65 30 L55 15 C52 10 44 8 40 8 C36 8 28 10 25 15Z" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="40" y1="18" x2="40" y2="40" stroke="#d8d8d8" strokeWidth="1" strokeDasharray="2,2"/>
      </svg>
    ),
    shoe: (
      <svg {...props}>
        <path d="M12 55 C12 55 18 38 30 35 L48 32 C54 31 62 34 66 42 L68 55 Z" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M30 35 L32 22 C33 18 38 17 42 19 L48 32" fill="#e8e8e8" stroke="#d0d0d0" strokeWidth="1.5"/>
      </svg>
    ),
    ring: (
      <svg {...props}>
        <circle cx="40" cy="40" r="20" fill="none" stroke="#d0d0d0" strokeWidth="8"/>
        <circle cx="40" cy="20" r="7" fill="#f0f0f0" stroke="#c8c8c8" strokeWidth="1.5"/>
        <ellipse cx="40" cy="20" rx="4" ry="5" fill="#e8e8f8" stroke="#c0c0d8" strokeWidth="1"/>
      </svg>
    ),
    dupatta: (
      <svg {...props}>
        <path d="M10 25 Q40 15 70 25 L65 60 Q40 70 15 60 Z" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5"/>
        <path d="M10 25 Q40 15 70 25" stroke="#c8c8c8" strokeWidth="1" fill="none"/>
        <rect x="10" y="57" width="60" height="5" rx="1" fill="#e0e0e0" stroke="#c8c8c8" strokeWidth="1"/>
      </svg>
    ),
    bracelet: (
      <svg {...props}>
        <ellipse cx="40" cy="42" rx="22" ry="14" fill="none" stroke="#d0d0d0" strokeWidth="6"/>
        <ellipse cx="40" cy="42" rx="22" ry="14" fill="none" stroke="#e8e8e8" strokeWidth="4"/>
        <circle cx="40" cy="28" r="5" fill="#f0f0f0" stroke="#c8c8c8" strokeWidth="1.5"/>
      </svg>
    ),
    necklace: (
      <svg {...props}>
        <path d="M20 18 Q40 12 60 18 Q68 35 60 52 Q50 62 40 64 Q30 62 20 52 Q12 35 20 18" fill="none" stroke="#d0d0d0" strokeWidth="2.5"/>
        <circle cx="40" cy="62" r="7" fill="#f0f0f0" stroke="#c8c8c8" strokeWidth="1.5"/>
        <ellipse cx="40" cy="62" rx="4" ry="5" fill="#e8f0f8" stroke="#b8c8d8" strokeWidth="1"/>
      </svg>
    ),
    hairclip: (
      <svg {...props}>
        <path d="M20 35 Q20 20 40 20 Q60 20 60 35 L58 48 Q50 55 40 55 Q30 55 22 48 Z" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5"/>
        <path d="M20 35 Q40 42 60 35" stroke="#d0d0d0" strokeWidth="1.2" fill="none"/>
        <circle cx="40" cy="30" r="5" fill="#e8e8f0" stroke="#c8c8d8" strokeWidth="1"/>
      </svg>
    ),
  }
  return shapes[shape] || shapes.bow
}

export default function LandingPage() {
  const [hoveredPlan, setHoveredPlan] = React.useState(null)
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-neutral-900">ShipSmart</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-neutral-600">
            <a href="#features" className="hover:text-neutral-900 transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-neutral-900 transition-colors">Pricing</a>
            <Link to="/login"    className="hover:text-neutral-900 transition-colors">Log in</Link>
          </div>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">
            Start free <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap size={11} fill="currentColor" /> Optimised for Meesho listing algorithm
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.1] tracking-tight mb-5">
            Upload once.<br />
            Get <span className="text-brand-500">12 images</span> that<br />
            cut your shipping cost.
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-8 leading-relaxed">
            ShipSmart generates 12 Meesho-optimised product image variants from a single upload — white background, perfect dimensions, minimum file size — all tuned to lower your per-shipment charges.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base px-6 py-3">
              Start free — 10 images included <ArrowRight size={16} />
            </Link>
            <a href="#features" className="btn-secondary text-base px-6 py-3">
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-neutral-400">No credit card required · Free plan includes 10 images</p>
        </motion.div>

        {/* Hero image mock */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-14 relative max-w-3xl mx-auto"
        >
          <div className="card p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-neutral-900">Your 12 optimised variants</h3>
                <p className="text-sm text-neutral-500">Sorted by shipping score</p>
              </div>
              <div className="text-xs font-mono bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-semibold">
                Top score: 100/100
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[
                { score: 100, shape: 'bow',      label: 'Best for Meesho' },
                { score: 97,  shape: 'tshirt',   label: null },
                { score: 95,  shape: 'bag',      label: null },
                { score: 92,  shape: 'watch',    label: null },
                { score: 89,  shape: 'earring',  label: null },
                { score: 86,  shape: 'kurta',    label: null },
                { score: 83,  shape: 'shoe',     label: null },
                { score: 80,  shape: 'ring',     label: null },
                { score: 77,  shape: 'dupatta',  label: null },
                { score: 74,  shape: 'bracelet', label: null },
                { score: 71,  shape: 'necklace', label: null },
                { score: 68,  shape: 'hairclip', label: null },
              ].map((v, i) => (
                <div key={i} className={`aspect-square rounded-xl border bg-white flex flex-col items-center justify-center relative overflow-hidden
                  ${i === 0 ? 'ring-2 ring-brand-400 border-brand-200' : 'border-neutral-100'}`}
                >
                  {/* White background product silhouette */}
                  <div className="w-full h-full flex items-center justify-center p-[15%]">
                    <ProductShape shape={v.shape} />
                  </div>
                  {/* Score badge */}
                  <div className="absolute bottom-1 right-1">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      v.score >= 85 ? 'bg-green-500 text-white' :
                      v.score >= 70 ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {v.score}
                    </span>
                  </div>
                  {/* Best badge */}
                  {i === 0 && (
                    <div className="absolute top-1 left-1 bg-brand-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full leading-tight">
                      BEST
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
              <span>1 credit used · 12 variants generated</span>
              <span className="text-green-600 font-medium">Est. saving ₹20–35/order</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="bg-neutral-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-neutral-900 mb-3">Everything you need to sell smarter</h2>
            <p className="text-neutral-500 text-lg">Built specifically for Meesho sellers who want lower shipping costs and better listings</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-brand-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How shipping score works */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold text-neutral-900 mb-4">How our score reduces your shipping cost</h2>
            <p className="text-neutral-500 mb-6 leading-relaxed">
              Meesho calculates shipping using volumetric weight: <span className="font-mono text-sm bg-neutral-100 px-2 py-0.5 rounded">(L × W × H) ÷ 5000</span>.
              An optimised image signals a compact, standard product — keeping you in the lowest shipping slab.
            </p>
            <div className="space-y-3">
              {[
                { pts: 35, factor: 'File size under 200 KB', why: 'Prevents auto-resize which inflates detected dimensions' },
                { pts: 20, factor: 'White background',       why: 'Avoids "oversized" category detection surcharges' },
                { pts: 20, factor: 'Square 1:1 format',      why: 'Signals compact packaging to volumetric estimator' },
                { pts: 20, factor: 'Exact 1080×1080 px',     why: "Meesho's recommended spec — no padding injection" },
                { pts:  5, factor: 'Proper brightness',      why: 'Reduces return rates → lower weighted shipping tier' },
              ].map(({ pts, factor, why }) => (
                <div key={factor} className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
                  <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-green-700">+{pts}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{factor}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6 shadow-lg">
            <h3 className="font-semibold text-neutral-900 mb-4">Estimated savings per order</h3>
            <div className="space-y-3">
              {[
                { range: '85–100', slab: '0–500g slab', saving: '₹20–35 saved', color: 'bg-green-500' },
                { range: '70–84',  slab: '500g–1kg slab', saving: '₹10–20 saved', color: 'bg-blue-500' },
                { range: '55–69',  slab: '1–2kg slab',   saving: '₹0–10 saved',  color: 'bg-amber-500' },
                { range: '0–54',   slab: '2kg+ slab',    saving: 'No saving',    color: 'bg-red-400' },
              ].map(({ range, slab, saving, color }) => (
                <div key={range} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                  <div className="flex-1">
                    <span className="text-xs font-mono font-semibold text-neutral-700">Score {range}</span>
                    <span className="text-xs text-neutral-500 ml-2">→ {slab}</span>
                  </div>
                  <span className="text-xs font-semibold text-neutral-800">{saving}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-4">Based on Meesho standard 0.5 kg slab rate. Actual savings may vary.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-neutral-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-semibold text-neutral-900 text-center mb-10">Sellers love ShipSmart</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-5">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }, (_, i) => (
                    <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-neutral-900 mb-3">Simple pricing</h2>
          <p className="text-neutral-500">Start free. Upgrade when you grow.</p>
          <p className="text-xs text-neutral-400 mt-1">1 credit = 1 product image → 12 optimised variants</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const isHighlighted = hoveredPlan ? hoveredPlan === plan.id : plan.highlight
            return (
              <div
                key={plan.id}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`card p-5 flex flex-col cursor-pointer transition-all duration-200
                  ${isHighlighted ? 'ring-2 ring-brand-400 shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
              >
                {plan.highlight && !hoveredPlan && (
                  <div className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-2">Most popular</div>
                )}
                {hoveredPlan === plan.id && (
                  <div className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-2">Selected</div>
                )}
                {!plan.highlight && hoveredPlan !== plan.id && (
                  <div className="text-[10px] mb-2 opacity-0">placeholder</div>
                )}
                <h3 className="font-semibold text-neutral-900 mb-1">{plan.name}</h3>
                <div className="mb-1">
                  <span className="text-2xl font-semibold text-neutral-900">{plan.price}</span>
                  <span className="text-sm text-neutral-500">{plan.period}</span>
                </div>
                <p className="text-sm font-semibold text-brand-600 mb-0.5">{plan.credits}</p>
                <p className="text-xs text-neutral-400 mb-4">{plan.sub}</p>
                <div className="space-y-2 mb-5 flex-1">
                  {['12 variants per image', 'AI BG removal', 'Shipping score', 'ZIP download'].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-neutral-600">
                      <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  to="/register"
                  className={isHighlighted
                    ? 'btn-primary text-sm w-full justify-center'
                    : 'btn-secondary text-sm w-full justify-center'}
                >
                  Get started
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-500 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">Ready to lower your shipping costs?</h2>
          <p className="text-brand-100 mb-6 text-lg">Join thousands of Meesho sellers using ShipSmart to optimise their listings.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors">
            Start for free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-brand-500 rounded flex items-center justify-center">
              <Zap size={10} className="text-white" />
            </div>
            ShipSmart
          </div>
          <p>© {new Date().getFullYear()} ShipSmart. Built for Meesho sellers.</p>
        </div>
      </footer>
    </div>
  )
}
