export type Motif =
  | 'mountains'
  | 'forest'
  | 'ocean'
  | 'desert'
  | 'space'
  | 'city'
  | 'ruins'
  | 'dream'

export type Palette = {
  sky: string
  deep: string
  accent: string
  glow: string
}

export interface ArtSpec {
  motif: Motif
  palette: Palette
  seed: number
}

export type Genre =
  | 'Fantasy'
  | 'Sci-Fi'
  | 'Cyberpunk'
  | 'Mystery'
  | 'Horror'
  | 'Romance'
  | 'Mythic'
  | 'Historical'
  | 'Post-Apocalyptic'
  | 'Slice of Life'

export type StatKey = 'might' | 'wits' | 'charm' | 'spirit' | 'agility'

export type Stats = Record<StatKey, number>

export type Difficulty = 'Story' | 'Balanced' | 'Brutal'

export type ContentRating = 'Everyone' | 'Teen' | 'Mature'

export type NpcDisposition = 'friendly' | 'wary' | 'neutral' | 'hostile'

export interface WorldNpc {
  id: string
  name: string
  role: string
  description: string
  disposition: NpcDisposition
  locationId?: string
  secret?: string
}

export type LocationKind = 'hub' | 'town' | 'wild' | 'dungeon' | 'landmark'

export interface WorldLocation {
  id: string
  name: string
  description: string
  kind: LocationKind
  x: number
  y: number
}

export interface QuestTemplate {
  id: string
  title: string
  hook: string
  objective: string
  rewardXp: number
  rewardGold: number
  itemId?: string
}

export type ItemKind = 'weapon' | 'armor' | 'relic' | 'consumable' | 'trinket'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export interface ItemTemplate {
  id: string
  name: string
  kind: ItemKind
  description: string
  rarity: Rarity
  bonus?: { stat?: StatKey; value?: number; heal?: number; extra?: Partial<Stats> }
}

export interface World {
  id: string
  title: string
  tagline: string
  description: string
  genre: Genre
  tags: string[]
  rating: number
  ratingCount: number
  plays: number
  creatorId: string
  creatorName: string
  creatorHandle: string
  art: ArtSpec
  difficulty: Difficulty
  contentRating: ContentRating
  npcs: WorldNpc[]
  locations: WorldLocation[]
  quests: QuestTemplate[]
  items: ItemTemplate[]
  opening: string
  premise: string
  featured?: boolean
  official?: boolean
  published: boolean
  createdAt: number
}

export type ArchetypeId = 'blade' | 'scholar' | 'envoy' | 'mystic' | 'shadow'

export interface Archetype {
  id: ArchetypeId
  name: string
  tagline: string
  description: string
  primary: StatKey
  secondary: StatKey
  hpBonus: number
  startingItem: ItemTemplate
  traitPool: string[]
}

export interface Character {
  name: string
  pronouns: string
  archetype: ArchetypeId
  portrait: ArtSpec
  stats: Stats
  traits: string[]
  bio: string
}

export interface InventoryItem {
  key: string
  templateId?: string
  name: string
  kind: ItemKind
  description: string
  rarity: Rarity
  qty: number
  bonus?: { stat?: StatKey; value?: number; heal?: number; extra?: Partial<Stats> }
}

export type QuestStatus = 'active' | 'complete' | 'failed'

export interface QuestState {
  id: string
  title: string
  objective: string
  status: QuestStatus
  progress: number
  rewardXp: number
  rewardGold: number
  itemId?: string
}

export type StoryKind =
  | 'narration'
  | 'player'
  | 'dialogue'
  | 'system'
  | 'check'
  | 'loot'
  | 'level'
  | 'quest'

export interface RollResult {
  stat: StatKey
  die: number
  mod: number
  total: number
  dc: number
  success: boolean
  crit: 'success' | 'fail' | null
}

export interface StoryBlock {
  id: string
  kind: StoryKind
  text: string
  speaker?: string
  roll?: RollResult
  at: number
}

export interface JournalEntry {
  id: string
  turn: number
  title: string
  text: string
  kind: 'discovery' | 'event' | 'quest' | 'relationship' | 'note'
}

export interface SaveState {
  id: string
  worldId: string
  customTitle?: string
  character: Character
  turn: number
  locationId: string
  hp: number
  maxHp: number
  xp: number
  level: number
  gold: number
  inventory: InventoryItem[]
  equipped: string[]
  quests: QuestState[]
  journal: JournalEntry[]
  relationships: Record<string, number>
  discovered: string[]
  visited: string[]
  story: StoryBlock[]
  flags: Record<string, number | string | boolean>
  status: 'active' | 'complete'
  createdAt: number
  updatedAt: number
  lastLine: string
}

export interface User {
  id: string
  name: string
  handle: string
  email?: string
  signedIn: boolean
  avatar: ArtSpec
  streak: number
  lastPlayed: string
  joinedAt: number
  plan: 'free' | 'plus' | 'studio'
}

export interface Settings {
  reducedMotion: boolean
  sound: boolean
  textSize: 'sm' | 'md' | 'lg'
  defaultRating: ContentRating
  autoSuggest: boolean
  showRolls: boolean
}

export interface AppData {
  version: number
  user: User
  worlds: World[]
  saves: SaveState[]
  settings: Settings
  following: string[]
}

export type View =
  | { name: 'home' }
  | { name: 'discover'; genre?: Genre }
  | { name: 'world'; id: string }
  | { name: 'create'; worldId: string }
  | { name: 'play'; saveId: string }
  | { name: 'library' }
  | { name: 'studio' }
  | { name: 'studioEdit'; id: string }
  | { name: 'profile' }
  | { name: 'pricing' }
  | { name: 'settings' }
  | { name: 'notfound' }
