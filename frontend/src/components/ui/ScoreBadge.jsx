// src/components/ui/ScoreBadge.jsx
export function scoreColor(score) {
  if (score >= 85) return { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', bar: 'bg-green-500',  label: 'Excellent' }
  if (score >= 70) return { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',  bar: 'bg-blue-500',   label: 'Good' }
  if (score >= 55) return { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', bar: 'bg-amber-500',  label: 'Fair' }
  return              { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   bar: 'bg-red-500',    label: 'Poor' }
}

export default function ScoreBadge({ score, size = 'md' }) {
  const c = scoreColor(score)
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1', lg: 'text-base px-3 py-1.5' }
  return (
    <span className={`inline-flex items-baseline gap-0.5 font-semibold rounded-full border font-mono ${c.bg} ${c.text} ${c.border} ${sizes[size]}`}>
      {score}
      <span className="font-normal opacity-50 font-sans" style={{ fontSize: '0.65em', lineHeight: 1 }}>/100</span>
    </span>
  )
}
