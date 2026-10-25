import { useSyncExternalStore } from 'react'
import type { View } from '../types'

function parseHash(): View {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const [path, ...rest] = raw.split('/')
  const param = rest.join('/')
  switch (path) {
    case '':
      return { name: 'home' }
    case 'discover':
      return rest.length ? { name: 'discover', genre: decodeURIComponent(param) as never } : { name: 'discover' }
    case 'world':
      return { name: 'world', id: param }
    case 'create':
      return { name: 'create', worldId: param }
    case 'play':
      return { name: 'play', saveId: param }
    case 'library':
      return { name: 'library' }
    case 'studio':
      return rest[0] === 'edit' // studio/edit/:id
        ? { name: 'studioEdit', id: rest.slice(1).join('/') }
        : { name: 'studio' }
    case 'profile':
      return { name: 'profile' }
    case 'pricing':
      return { name: 'pricing' }
    case 'settings':
      return { name: 'settings' }
    default:
      return { name: 'notfound' }
  }
}

const listeners = new Set<() => void>()
let current = parseHash()

function notify() {
  current = parseHash()
  for (const l of listeners) l()
}

window.addEventListener('hashchange', notify)

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useView(): View {
  return useSyncExternalStore(subscribe, () => current)
}

export function navigate(to: string) {
  const frag = to.startsWith('#') ? to.slice(1) : to
  const next = `#${frag}`
  if (window.location.hash === next) {
    notify()
  } else {
    window.location.hash = frag
  }
}

export function hrefFor(view: View): string {
  switch (view.name) {
    case 'home':
      return '#/'
    case 'discover':
      return view.genre ? `#/discover/${encodeURIComponent(view.genre)}` : '#/discover'
    case 'world':
      return `#/world/${view.id}`
    case 'create':
      return `#/create/${view.worldId}`
    case 'play':
      return `#/play/${view.saveId}`
    case 'library':
      return '#/library'
    case 'studio':
      return '#/studio'
    case 'studioEdit':
      return `#/studio/edit/${view.id}`
    case 'profile':
      return '#/profile'
    case 'pricing':
      return '#/pricing'
    case 'settings':
      return '#/settings'
    default:
      return '#/'
  }
}

export function go(view: View) {
  navigate(hrefFor(view))
}
