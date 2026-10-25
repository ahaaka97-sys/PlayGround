import type { AppData, World } from '../types'
import { SEED_WORLDS } from './worlds'

export const CREATOR_STATS = [
  { id: 'odyssey-originals', name: 'Odyssey Originals', handle: 'odyssey', followers: 184_300, worldsLabel: '2 worlds', blurb: 'The official studio behind Odyssey\u2019s launch worlds.' },
  { id: 'mara-vex', name: 'Mara Vex', handle: 'maravex', followers: 96_800, worldsLabel: '3 worlds', blurb: 'Noir futures and people who lie beautifully.' },
  { id: 'solstice', name: 'Solstice', handle: 'solstice', followers: 88_100, worldsLabel: '1 world', blurb: 'Wonders above the void, written gently.' },
  { id: 'ink-iron', name: 'Ink & Iron', handle: 'inkandiron', followers: 74_500, worldsLabel: '2 worlds', blurb: 'Folk tales, old forests, and worse bargains.' },
  { id: 'tideglass', name: 'Tideglass', handle: 'tideglass', followers: 61_200, worldsLabel: '2 worlds', blurb: 'Salt, silk, and drowned gods.' },
  { id: 'kestrel-k', name: 'Kestrel K.', handle: 'kestrelk', followers: 53_400, worldsLabel: '1 world', blurb: 'Quiet horror with excellent manners.' },
  { id: 'quiet-machine', name: 'Quiet Machine', handle: 'quietmachine', followers: 47_900, worldsLabel: '2 worlds', blurb: 'Signal in the static, hopepunk in the ruins.' },
]

export function creatorById(id: string) {
  return CREATOR_STATS.find((c) => c.id === id)
}

export function defaultUser(): AppData['user'] {
  return {
    id: 'you',
    name: 'Guest',
    handle: 'guest',
    signedIn: false,
    avatar: { motif: 'dream', palette: { sky: '#3a2a5e', deep: '#1a1030', accent: '#b388ff', glow: '#ffd6a5' }, seed: 3 },
    streak: 0,
    lastPlayed: '',
    joinedAt: Date.now(),
    plan: 'free',
  }
}

export function defaultSettings(): AppData['settings'] {
  return {
    reducedMotion: false,
    sound: true,
    textSize: 'md',
    defaultRating: 'Teen',
    autoSuggest: true,
    showRolls: true,
  }
}

export function makeInitialData(): AppData {
  return {
    version: 1,
    user: defaultUser(),
    worlds: SEED_WORLDS,
    saves: [],
    settings: defaultSettings(),
    following: [],
  }
}

export function worldPlayedCount(w: World): number {
  return w.plays
}
