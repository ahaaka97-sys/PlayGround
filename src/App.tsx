import { useMemo } from 'react'
import { Compass } from 'lucide-react'
import type { Genre } from './types'
import { useView } from './lib/router'
import { StoreProvider, useApp } from './state/store'
import { TopNav } from './components/topnav'
import { ToastHost } from './components/ui'
import { HomePage } from './pages/Home'
import { DiscoverPage } from './pages/Discover'
import { WorldPage } from './pages/WorldPage'
import { CreatePage } from './pages/Create'
import { PlayPage } from './pages/Play'
import { LibraryPage } from './pages/Library'
import { StudioPage, StudioEditPage } from './pages/Studio'
import { ProfilePage } from './pages/Profile'
import { PricingPage } from './pages/Pricing'
import { SettingsPage } from './pages/Settings'

function NotFound() {
  return (
    <div className="page center notfound">
      <Compass size={34} />
      <h1>Off the map</h1>
      <p>This page isn't on any cartographer's chart. Head back toward known lands.</p>
      <a className="btn btn-primary" href="#/">
        Return home
      </a>
    </div>
  )
}

function Routes() {
  const view = useView()
  const { data } = useApp()

  const body = useMemo(() => {
    switch (view.name) {
      case 'home':
        return <HomePage />
      case 'discover':
        return <DiscoverPage genre={view.genre as Genre | undefined} />
      case 'world':
        return <WorldPage id={view.id} />
      case 'create':
        return <CreatePage worldId={view.worldId} />
      case 'play':
        return <PlayPage saveId={view.saveId} />
      case 'library':
        return <LibraryPage />
      case 'studio':
        return <StudioPage />
      case 'studioEdit':
        return <StudioEditPage id={view.id} />
      case 'profile':
        return <ProfilePage />
      case 'pricing':
        return <PricingPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <NotFound />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, data.worlds.length, data.saves.length])

  return body
}

function Shell() {
  const view = useView()
  const immersive = view.name === 'play' || view.name === 'create'
  return (
    <div className={`app ${immersive ? 'immersive' : ''} textSize-${useApp().data.settings.textSize}`}>
      {view.name !== 'play' && <TopNav />}
      <Routes />
      {view.name !== 'play' && (
        <footer className="footer">
          <div className="footer-inner">
            <span className="brand-mini">
              <strong>Odyssey</strong> — worlds that remember
            </span>
            <nav>
              <a href="#/discover">Discover</a>
              <a href="#/studio">Studio</a>
              <a href="#/pricing">Pricing</a>
              <a href="#/settings">Settings</a>
            </nav>
            <span className="foot-note">An original, fully local AI-roleplay demo. Fiction is generated; dice are honest.</span>
          </div>
        </footer>
      )}
      <ToastHost />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
