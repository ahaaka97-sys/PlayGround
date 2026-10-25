import { useState } from 'react'
import { Compass, Library, Hammer, Crown, Search, Flame, Menu, X, LogOut, Settings as Cog, User2 } from 'lucide-react'
import { useApp } from '../state/store'
import { go, navigate, hrefFor } from '../lib/router'
import { Avatar } from './CoverArt'
import { Modal } from './ui'
import type { View } from '../types'

export function TopNav() {
  const { data, signIn, signOut } = useApp()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)
  const [auth, setAuth] = useState(false)
  const view: View = { name: 'home' }

  const links: { label: string; href: string; icon: JSX.Element }[] = [
    { label: 'Discover', href: '#/discover', icon: <Compass size={16} /> },
    { label: 'Library', href: '#/library', icon: <Library size={16} /> },
    { label: 'Studio', href: '#/studio', icon: <Hammer size={16} /> },
    { label: 'Pricing', href: '#/pricing', icon: <Crown size={16} /> },
  ]

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/discover')
    setQ('')
  }

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <a className="brand" href="#/" aria-label="Odyssey home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="26" height="26">
              <defs>
                <linearGradient id="brandg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f6c66b" />
                  <stop offset="1" stopColor="#e0598b" />
                </linearGradient>
              </defs>
              <path d="M16 3l2.9 9.1L28 15l-9.1 2.9L16 27l-2.9-9.1L4 15l9.1-2.9z" fill="url(#brandg)" />
            </svg>
          </span>
          <span className="brand-name">Odyssey</span>
        </a>

        <form className="nav-search" onSubmit={submit} role="search">
          <Search size={15} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search worlds, genres, creators…"
            aria-label="Search worlds"
          />
        </form>

        <nav className="nav-links">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="nav-link">
              {l.icon}
              <span>{l.label}</span>
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          {data.user.streak > 0 && (
            <span className="streak" title="Daily streak">
              <Flame size={15} /> {data.user.streak}
            </span>
          )}
          {data.user.signedIn ? (
            <button className="avatar-btn" onClick={() => setMenu(!menu)} aria-haspopup="menu">
              <Avatar art={data.user.avatar} name={data.user.name} size={34} />
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setAuth(true)}>
              Sign in
            </button>
          )}
          <button className="icon-btn nav-burger" onClick={() => setMenu(!menu)} aria-label="Menu">
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menu && (
        <div className="nav-menu" onMouseLeave={() => setMenu(false)}>
          {data.user.signedIn && (
            <div className="nav-menu-user">
              <Avatar art={data.user.avatar} name={data.user.name} size={38} />
              <div>
                <strong>{data.user.name}</strong>
                <span>@{data.user.handle}</span>
              </div>
            </div>
          )}
          <a href={hrefFor(view)} onClick={() => setMenu(false)}>Home</a>
          <a href="#/profile" onClick={() => setMenu(false)}><User2 size={14} /> Profile</a>
          <a href="#/settings" onClick={() => setMenu(false)}><Cog size={14} /> Settings</a>
          {data.user.signedIn ? (
            <button
              onClick={() => {
                signOut()
                setMenu(false)
              }}
            >
              <LogOut size={14} /> Sign out
            </button>
          ) : (
            <button onClick={() => { setAuth(true); setMenu(false) }}>Sign in</button>
          )}
        </div>
      )}

      {auth && (
        <Modal title="Welcome to Odyssey" onClose={() => setAuth(false)}>
          <SignInForm
            onDone={(name, handle) => {
              signIn(name, handle)
              setAuth(false)
            }}
          />
        </Modal>
      )}
    </header>
  )
}

export function SignInForm({ onDone }: { onDone: (name: string, handle: string) => void }) {
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        onDone(name.trim() || 'Wanderer', (handle.trim() || name.trim() || 'wanderer').replace(/\s+/g, '').toLowerCase())
      }}
    >
      <p className="form-hint">
        Your profile lives in this browser only. Pick any name — the worlds will remember you anyway.
      </p>
      <label className="field">
        <span>Display name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rael of the Ember Court" maxLength={32} />
      </label>
      <label className="field">
        <span>Handle</span>
        <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="e.g. rael" maxLength={20} />
      </label>
      <button className="btn btn-primary" type="submit">
        Start your journey
      </button>
      <p className="form-note">No email, no password, no servers — everything is stored locally.</p>
    </form>
  )
}
