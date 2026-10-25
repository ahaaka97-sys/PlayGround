import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { onToast } from '../state/store'
import type { Rarity } from '../types'
import { stars } from '../lib/funcs'

export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#9aa4b2',
  uncommon: '#5fd68b',
  rare: '#5aa5fa',
  legendary: '#f6c66b',
}

export function Pill({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'accent' | 'warn' | 'danger' | 'good'
  className?: string
}) {
  return <span className={`pill pill-${tone} ${className ?? ''}`}>{children}</span>
}

export function RatingBadge({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="rating">
      <span className="rating-star">★</span>
      {rating > 0 ? rating.toFixed(1) : 'New'}
      {count ? <span className="rating-count">{fmtCount(count)}</span> : null}
    </span>
  )
}

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return `${n}`
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title?: ReactNode
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', fn)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return (
    <div className="modal-root" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function Section({
  title,
  action,
  onAction,
  children,
  id,
}: {
  title: ReactNode
  action?: ReactNode
  onAction?: () => void
  children: ReactNode
  id?: string
}) {
  return (
    <section className="section" id={id}>
      <div className="section-head">
        <h2>{title}</h2>
        {action ? (
          onAction ? (
            <button className="link-btn" onClick={onAction}>
              {action}
            </button>
          ) : (
            <span className="section-action">{action}</span>
          )
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({ icon, title, hint, cta }: { icon: ReactNode; title: string; hint?: string; cta?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {hint && <div className="empty-hint">{hint}</div>}
      {cta}
    </div>
  )
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { id: T; label: string; badge?: number }[]
  value: T
  onChange: (id: T) => void
  className?: string
}) {
  return (
    <div className={`tabs ${className ?? ''}`} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          className={`tab ${value === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.badge ? <span className="tab-badge">{t.badge}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function StatBar({ value, max, tone }: { value: number; max: number; tone?: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="statbar" role="presentation">
      <div className="statbar-fill" style={{ width: `${pct}%`, background: tone }} />
    </div>
  )
}

export function Stars({ value }: { value: number }) {
  return <span className="stars">{stars(value)}</span>
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let t: number
    const off = onToast((m) => {
      setMsg(m)
      window.clearTimeout(t)
      t = window.setTimeout(() => setMsg(null), 3200)
    })
    return () => {
      off()
      window.clearTimeout(t)
    }
  }, [])
  if (!msg) return null
  return (
    <div className="toast" role="status">
      {msg}
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      {label && <div className="spinner-label">{label}</div>}
    </div>
  )
}
