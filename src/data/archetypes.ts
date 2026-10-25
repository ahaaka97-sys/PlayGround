import type { Archetype, StatKey } from '../types'

export const TRAITS: Record<string, { description: string; stat: StatKey }> = {
  'Iron-Willed': { description: 'You do not break under pressure.', stat: 'spirit' },
  'Silver Tongue': { description: 'Words come easily, and land where they should.', stat: 'charm' },
  'Quick Hands': { description: 'You are always the first to move.', stat: 'agility' },
  'Bookwise': { description: 'You have read more than most people live.', stat: 'wits' },
  'Hardened': { description: 'Pain is an old acquaintance.', stat: 'might' },
  'Haunted': { description: 'Something follows you, just out of sight.', stat: 'spirit' },
  'Curious': { description: 'You cannot leave a door unopened.', stat: 'wits' },
  'Loyal': { description: 'You do not abandon people.', stat: 'charm' },
  'Reckless': { description: 'You leap before you look.', stat: 'might' },
  'Patient': { description: 'You can wait longer than the world can.', stat: 'spirit' },
  'Streetwise': { description: 'You know how cities lie.', stat: 'wits' },
  'Fey-Touched': { description: 'Something old noticed you at birth.', stat: 'spirit' },
  'Stoic': { description: 'You keep your feelings behind your teeth.', stat: 'might' },
  'Charming Rogue': { description: 'Trouble, but the charming kind.', stat: 'charm' },
  'Lightfooted': { description: 'You leave no trace worth following.', stat: 'agility' },
  'Oathbound': { description: 'A promise keeps your spine straight.', stat: 'spirit' },
  'Wide-Eyed': { description: 'You still believe in wonders.', stat: 'charm' },
  'Scarred': { description: 'You survived something you do not discuss.', stat: 'might' },
  'Sharp-Eyed': { description: 'Almost nothing escapes you.', stat: 'wits' },
  'Restless': { description: 'Stillness is its own kind of death.', stat: 'agility' },
}

export const STAT_LABELS: Record<StatKey, string> = {
  might: 'Might',
  wits: 'Wits',
  charm: 'Charm',
  spirit: 'Spirit',
  agility: 'Agility',
}

export const STAT_BLURB: Record<StatKey, string> = {
  might: 'Force, endurance, and the willingness to stand your ground.',
  wits: 'Observation, memory, and the patient work of putting pieces together.',
  charm: 'Presence, persuasion, and the art of being believed.',
  spirit: 'Will, intuition, and your sensitivity to things unseen.',
  agility: 'Speed, grace, and getting out of the way of trouble.',
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'blade',
    name: 'The Blade',
    tagline: 'Solve the problem in front of you.',
    description:
      'You were trained to end fights, not start them. Steel is a language you speak fluently, and the people you protect tend to remember your name.',
    primary: 'might',
    secondary: 'agility',
    hpBonus: 4,
    startingItem: {
      id: 'notched-longsword',
      name: 'Notched Longsword',
      kind: 'weapon',
      description: 'A serviceable blade with a history it refuses to tell.',
      rarity: 'uncommon',
      bonus: { stat: 'might', value: 1 },
    },
    traitPool: ['Hardened', 'Reckless', 'Stoic', 'Oathbound', 'Loyal', 'Scarred', 'Quick Hands', 'Patient'],
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    tagline: 'Read the room. Then read the room.',
    description:
      'You collect facts the way other people collect debts. A locked door is a puzzle, a lie is a typo, and every ruin is a letter addressed to someone patient enough to answer.',
    primary: 'wits',
    secondary: 'spirit',
    hpBonus: 0,
    startingItem: {
      id: 'field-codex',
      name: 'Field Codex',
      kind: 'relic',
      description: 'Half journal, half weapon. The margins are full of warnings in your own hand.',
      rarity: 'uncommon',
      bonus: { stat: 'wits', value: 1 },
    },
    traitPool: ['Bookwise', 'Curious', 'Sharp-Eyed', 'Patient', 'Streetwise', 'Haunted', 'Iron-Willed', 'Wide-Eyed'],
  },
  {
    id: 'envoy',
    name: 'The Envoy',
    tagline: 'Every stranger is a door.',
    description:
      'You have talked your way into palaces and out of cellars. People tell you things they did not mean to, then thank you for listening. You call that work.',
    primary: 'charm',
    secondary: 'wits',
    hpBonus: 1,
    startingItem: {
      id: 'signet-of-passage',
      name: 'Signet of Safe Passage',
      kind: 'trinket',
      description: 'A borrowed crest that has opened more doors than any key.',
      rarity: 'uncommon',
      bonus: { stat: 'charm', value: 1 },
    },
    traitPool: ['Silver Tongue', 'Charming Rogue', 'Loyal', 'Wide-Eyed', 'Streetwise', 'Patient', 'Curious', 'Oathbound'],
  },
  {
    id: 'mystic',
    name: 'The Mystic',
    tagline: 'Listen to what the world is hiding.',
    description:
      'You feel weather before it arrives, and grief before it is spoken. The old powers are not gone; they are simply waiting for someone polite enough to ask.',
    primary: 'spirit',
    secondary: 'wits',
    hpBonus: 2,
    startingItem: {
      id: 'cracked-focus',
      name: 'Cracked Focus Stone',
      kind: 'relic',
      description: 'A warm shard of something that used to be whole. It hums when you are close to the truth.',
      rarity: 'uncommon',
      bonus: { stat: 'spirit', value: 1 },
    },
    traitPool: ['Fey-Touched', 'Haunted', 'Iron-Willed', 'Patient', 'Oathbound', 'Curious', 'Wide-Eyed', 'Sharp-Eyed'],
  },
  {
    id: 'shadow',
    name: 'The Shadow',
    tagline: 'Be the thing they never saw.',
    description:
      'You have made a career of exits. Roofs, back rooms, crowded streets at dusk — the world is full of doors for people who know where to look.',
    primary: 'agility',
    secondary: 'charm',
    hpBonus: 2,
    startingItem: {
      id: 'whisper-boots',
      name: 'Whisper Boots',
      kind: 'armor',
      description: 'Soft-soled and patched twice. They have never once announced you.',
      rarity: 'uncommon',
      bonus: { stat: 'agility', value: 1 },
    },
    traitPool: ['Quick Hands', 'Lightfooted', 'Restless', 'Streetwise', 'Charming Rogue', 'Curious', 'Scarred', 'Silver Tongue'],
  },
]

export function statMod(value: number): number {
  return Math.floor((value - 10) / 2)
}

export function baseStats(archetype: Archetype): Record<StatKey, number> {
  const stats: Record<StatKey, number> = {
    might: 10,
    wits: 10,
    charm: 10,
    spirit: 10,
    agility: 10,
  }
  stats[archetype.primary] += 3
  stats[archetype.secondary] += 1
  return stats
}
