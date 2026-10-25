import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppData, Character, SaveState, Settings, World } from '../types'
import { makeInitialData, defaultUser } from '../data/seed'
import { SEED_WORLDS } from '../data/worlds'
import { ARCHETYPES, baseStats, statMod } from '../data/archetypes'
import { uid, todayKey } from '../lib/funcs'

const KEY = 'odyssey.appdata.v1'

type AppDataStore = AppData & { userWorlds: World[] }

function load(): AppDataStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppDataStore
      if (parsed && Array.isArray(parsed.userWorlds) && parsed.user) {
        return {
          ...parsed,
          worlds: [...SEED_WORLDS, ...parsed.userWorlds],
        }
      }
    }
  } catch {
    // corrupted or unavailable storage — fall through to fresh state
  }
  const base = makeInitialData()
  return { ...base, userWorlds: [] }
}

function persist(data: AppDataStore) {
  try {
    const { worlds, ...rest } = data
    const seedIds = new Set(SEED_WORLDS.map((w) => w.id))
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...rest, userWorlds: worlds.filter((w) => !seedIds.has(w.id)) }),
    )
  } catch {
    // storage full or blocked — state remains in memory for the session
  }
}

export interface Store {
  data: AppData
  update: (fn: (d: AppDataStore) => void) => void
  user: () => AppData['user']
  settings: () => AppData['settings']
  setSettings: (patch: Partial<Settings>) => void
  signIn: (name: string, handle: string) => void
  signOut: () => void
  upgradePlan: (plan: AppData['user']['plan']) => void
  worldById: (id: string) => World | undefined
  saveById: (id: string) => SaveState | undefined
  savesFor: (worldId: string) => SaveState[]
  createSave: (worldId: string, character: Character, init?: (s: SaveState, w: World) => void) => SaveState
  updateSave: (id: string, fn: (s: SaveState) => void) => void
  deleteSave: (id: string) => void
  renameSave: (id: string, title: string) => void
  duplicateSave: (id: string) => void
  addWorld: (w: World) => void
  updateWorld: (id: string, fn: (w: World) => void) => void
  deleteWorld: (id: string) => void
  remixWorld: (id: string) => string
  toggleFollow: (creatorHandle: string) => void
  bumpStreak: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<AppDataStore>(load)

  useEffect(() => {
    persist(store)
  }, [store])

  const value = useMemo<Store>(() => {
    const update = (fn: (d: AppDataStore) => void) => {
      setStore((prev) => {
        const draft = structuredClone(prev)
        fn(draft)
        return draft
      })
    }
    return {
      data: store,
      update,
      user: () => store.user,
      settings: () => store.settings,
      setSettings: (patch) => update((d) => Object.assign(d.settings, patch)),
      signIn: (name, handle) =>
        update((d) => {
          d.user = { ...defaultUser(), ...d.user, name, handle: handle.toLowerCase(), signedIn: true }
        }),
      signOut: () =>
        update((d) => {
          d.user = { ...d.user, ...defaultUser(), streak: d.user.streak, joinedAt: d.user.joinedAt }
          d.user.signedIn = false
          d.user.name = 'Guest'
          d.user.handle = 'guest'
        }),
      upgradePlan: (plan) => update((d) => Object.assign(d.user, { plan })),
      worldById: (id) => store.worlds.find((w) => w.id === id),
      saveById: (id) => store.saves.find((s) => s.id === id),
      savesFor: (worldId) => store.saves.filter((s) => s.worldId === worldId),
      createSave: (worldId, character, init) => {
        const world = store.worlds.find((w) => w.id === worldId)
        const arch = ARCHETYPES.find((a) => a.id === character.archetype)!
        const stats = { ...baseStats(arch) }
        const maxHp = 12 + arch.hpBonus + statMod(stats.might)
        const starterKit = [
          { ...arch.startingItem, key: uid('item'), qty: 1 },
        ]
        const firstConsumable = world?.items.find((i) => i.kind === 'consumable')
        if (firstConsumable) starterKit.push({ ...firstConsumable, key: uid('item'), qty: 1 })
        const save: SaveState = {
          id: uid('save'),
          worldId,
          character,
          turn: 0,
          locationId: world?.locations[0]?.id ?? 'hub',
          hp: maxHp,
          maxHp,
          xp: 0,
          level: 1,
          gold: 25,
          inventory: starterKit,
          equipped: [],
          quests: (world?.quests ?? []).map((q) => ({
            id: q.id,
            title: q.title,
            objective: q.objective,
            status: 'active',
            progress: 0,
            rewardXp: q.rewardXp,
            rewardGold: q.rewardGold,
            itemId: q.itemId,
          })),
          journal: [],
          relationships: {},
          discovered: world ? [world.locations[0]?.id ?? 'hub'] : [],
          visited: [],
          story: [],
          flags: {},
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastLine: '',
        }
        init?.(save, world as World)
        update((d) => {
          d.saves.unshift(save)
          d.user.lastPlayed = todayKey()
        })
        return save
      },
      updateSave: (id, fn) =>
        update((d) => {
          const s = d.saves.find((x) => x.id === id)
          if (s) {
            fn(s)
            s.updatedAt = Date.now()
          }
        }),
      deleteSave: (id) =>
        update((d) => {
          d.saves = d.saves.filter((s) => s.id !== id)
        }),
      renameSave: (id, title) =>
        update((d) => {
          const s = d.saves.find((x) => x.id === id)
          if (s) {
            s.customTitle = title.trim() || undefined
            s.updatedAt = Date.now()
          }
        }),
      duplicateSave: (id) =>
        update((d) => {
          const s = d.saves.find((x) => x.id === id)
          if (s) {
            const copy = structuredClone(s)
            copy.id = uid('save')
            copy.createdAt = Date.now()
            copy.updatedAt = Date.now()
            copy.story = copy.story.map((b, i) => ({ ...b, id: `${copy.id}-b${i}` }))
            d.saves.unshift(copy)
          }
        }),
      addWorld: (w) =>
        update((d) => {
          d.worlds.unshift(w)
          d.userWorlds.unshift(w)
        }),
      updateWorld: (id, fn) =>
        update((d) => {
          const w = d.worlds.find((x) => x.id === id)
          if (w) fn(w)
        }),
      deleteWorld: (id) =>
        update((d) => {
          d.worlds = d.worlds.filter((w) => w.id !== id)
          d.userWorlds = d.userWorlds.filter((w) => w.id !== id)
          d.saves = d.saves.filter((s) => s.worldId !== id)
        }),
      remixWorld: (id) => {
        let newId = ''
        update((d) => {
          const src = d.worlds.find((w) => w.id === id)
          if (src) {
            newId = uid('world')
            const copy = structuredClone(src)
            copy.id = newId
            copy.creatorId = d.user.id
            copy.creatorName = d.user.name
            copy.creatorHandle = d.user.handle
            copy.title = `${src.title} — Remix`
            copy.official = false
            copy.featured = false
            copy.published = false
            copy.createdAt = Date.now()
            copy.rating = 0
            copy.ratingCount = 0
            copy.plays = 0
            d.worlds.unshift(copy)
            d.userWorlds.unshift(copy)
          }
        })
        return newId
      },
      toggleFollow: (handle) =>
        update((d) => {
          const i = d.following.indexOf(handle)
          if (i >= 0) d.following.splice(i, 1)
          else d.following.push(handle)
        }),
      bumpStreak: () =>
        update((d) => {
          const today = todayKey()
          if (d.user.lastPlayed !== today) {
            const yest = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
            d.user.streak = d.user.lastPlayed === yest ? d.user.streak + 1 : 1
            d.user.lastPlayed = today
          }
        }),
    }
  }, [store])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): Store {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside StoreProvider')
  return ctx
}

// Lightweight toast bus; avoids threading more state through context.
type ToastFn = (msg: string) => void
const toastListeners = new Set<ToastFn>()
export function toast(msg: string) {
  for (const l of toastListeners) l(msg)
}
export function onToast(fn: ToastFn) {
  toastListeners.add(fn)
  return () => toastListeners.delete(fn)
}
