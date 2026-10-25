import { useState } from 'react'
import { Download, RefreshCw, Check } from 'lucide-react'
import { useApp, toast } from '../state/store'
import { Tabs } from '../components/ui'
import type { Settings } from '../types'

export function SettingsPage() {
  const { data, setSettings, signOut, update } = useApp()
  const [tab, setTab] = useState<'display' | 'audio' | 'content' | 'data'>('display')
  const s = data.settings

  const toggle = (key: keyof Settings, label: string) => {
    setSettings({ [key]: !s[key] as never })
    toast(`${label} ${!s[key] ? 'on' : 'off'}`)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'odyssey-data.json'
    a.click()
    URL.revokeObjectURL(url)
    toast('Data exported')
  }

  const resetData = () => {
    if (confirm('Delete all saves, worlds, and profile from this browser? This cannot be undone.')) {
      localStorage.removeItem('odyssey.appdata.v1')
      location.hash = '#/'
      location.reload()
    }
  }

  return (
    <div className="page page-settings narrow">
      <header className="page-head">
        <h1>Settings</h1>
        <p>Tune how the worlds feel. Everything applies instantly.</p>
      </header>

      <Tabs
        value={tab}
        onChange={(t) => setTab(t)}
        tabs={[
          { id: 'display', label: 'Display' },
          { id: 'audio', label: 'Audio' },
          { id: 'content', label: 'Content' },
          { id: 'data', label: 'Your data' },
        ]}
      />

      {tab === 'display' && (
        <section className="settings-group glass">
          <Row title="Reduced motion" hint="Dim transitions and parallax for calmer screens.">
            <Toggle on={s.reducedMotion} onClick={() => toggle('reducedMotion', 'Reduced motion')} />
          </Row>
          <div className="sep" />
          <div className="row">
            <div>
              <strong>Story text size</strong>
              <span>Applies to the narration log.</span>
            </div>
            <div className="seg-row">
              {(['sm', 'md', 'lg'] as const).map((v) => (
                <button key={v} className={`seg ${s.textSize === v ? 'on' : ''}`} onClick={() => setSettings({ textSize: v })}>
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="sep" />
          <Row title="Show dice rolls" hint="Display the full d20 breakdown on skill checks.">
            <Toggle on={s.showRolls} onClick={() => toggle('showRolls', 'Dice roll details')} />
          </Row>
        </section>
      )}

      {tab === 'audio' && (
        <section className="settings-group glass">
          <Row title="Interface sounds" hint="Soft button and result stingers.">
            <Toggle on={s.sound} onClick={() => toggle('sound', 'Sounds')} />
          </Row>
          <div className="sep" />
          <Row title="AI action suggestions" hint="Offer three contextual action ideas each turn.">
            <Toggle on={s.autoSuggest} onClick={() => toggle('autoSuggest', 'Action suggestions')} />
          </Row>
        </section>
      )}

      {tab === 'content' && (
        <section className="settings-group glass">
          <div className="row">
            <div>
              <strong>Default content rating</strong>
              <span>Filter discovery to your comfort level.</span>
            </div>
            <div className="seg-row">
              {(['Everyone', 'Teen', 'Mature'] as const).map((v) => (
                <button key={v} className={`seg ${s.defaultRating === v ? 'on' : ''}`} onClick={() => setSettings({ defaultRating: v })}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === 'data' && (
        <section className="settings-group glass">
          <div className="row">
            <div>
              <strong>Profile</strong>
              <span>
                {data.user.signedIn ? `${data.user.name} · @${data.user.handle}` : 'Signed out — playing as Guest'}
              </span>
            </div>
            {data.user.signedIn && (
              <button className="btn btn-ghost btn-sm" onClick={() => { signOut(); toast('Signed out') }}>
                Sign out
              </button>
            )}
          </div>
          <div className="sep" />
          <div className="row">
            <div>
              <strong>Export everything</strong>
              <span>Download saves, worlds, and settings as JSON.</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={exportData}>
              <Download size={14} /> Export
            </button>
          </div>
          <div className="sep" />
          <div className="row">
            <div>
              <strong>Reset local data</strong>
              <span>Delete every save and world from this browser.</span>
            </div>
            <button className="btn danger-btn" onClick={resetData}>
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </section>
      )}

      <p className="muted center settings-foot">
        <Check size={13} /> Saved automatically to this browser · nothing syncs anywhere
      </p>
    </div>
  )
}

function Row({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <div>
        <strong>{title}</strong>
        <span>{hint}</span>
      </div>
      {children}
    </div>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button className={`switch ${on ? 'on' : ''}`} onClick={onClick} role="switch" aria-checked={on}>
      <span className="knob" />
    </button>
  )
}
