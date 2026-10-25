import type {
  InventoryItem,
  JournalEntry,
  RollResult,
  SaveState,
  StatKey,
  StoryBlock,
  World,
  WorldLocation,
  WorldNpc,
} from '../types'
import { statMod } from '../data/archetypes'
import { clamp, dice, pick, uid } from './funcs'

type Intent = 'attack' | 'social' | 'stealth' | 'investigate' | 'arcane' | 'travel' | 'rest' | 'item' | 'flee' | 'explore'

const KEYWORDS: Array<[Intent, string[]]> = [
  ['attack', ['attack', 'fight', 'strike', 'swing', 'stab', 'slash', 'shoot', 'punch', 'kick', 'ambush', 'shove', 'smash', 'burn the', 'charge', 'draw my']],
  ['social', ['talk', 'ask', 'persuade', 'convince', 'negotiate', 'beg', 'flirt', 'charm', 'comfort', 'apologize', 'greet', 'introduce', 'promise', 'question', 'bribe', 'speak', 'chat', 'tell']],
  ['stealth', ['sneak', 'hide', 'shadow', 'steal', 'pickpocket', 'slip', 'tiptoe', 'disguise', 'creep', 'lockpick', 'bypass']],
  ['investigate', ['search', 'examine', 'inspect', 'read', 'study', 'investigate', 'look', 'listen', 'check', 'analyze', 'review', 'survey', 'observe', 'measure']],
  ['arcane', ['cast', 'magic', 'ritual', 'pray', 'meditate', 'sense', 'attune', 'commune', 'scry', 'invoke', 'chant', 'channel', 'bless', 'hex']],
  ['travel', ['travel', 'walk', 'head', 'enter', 'leave', 'climb', 'sail', 'ride', 'descend', 'ascend', 'swim', 'crawl', 'wander', 'follow', 'cross', 'approach', 'set out']],
  ['rest', ['rest', 'sleep', 'camp', 'wait', 'recover', 'bandage', 'catch breath', 'breathe', 'reflect', 'write', 'journal', 'tend']],
  ['item', ['use the', 'drink', 'eat', 'uncork', 'apply', 'light the', 'ring the', 'crush', 'operate', 'turn on', 'activate', 'press the', 'open the']],
  ['flee', ['flee', 'run', 'escape', 'retreat', 'abandon', 'withdraw']],
]

function intentOf(action: string): Intent {
  const a = action.toLowerCase()
  for (const [intent, words] of KEYWORDS) {
    if (words.some((w) => a.includes(w))) return intent
  }
  return 'explore'
}

function statFor(intent: Intent, save: SaveState): StatKey {
  const s = save.character.stats
  switch (intent) {
    case 'attack':
      return s.might >= s.agility ? 'might' : 'agility'
    case 'social':
      return 'charm'
    case 'stealth':
      return 'agility'
    case 'investigate':
      return 'wits'
    case 'arcane':
      return 'spirit'
    case 'travel':
      return s.agility >= s.wits ? 'agility' : 'wits'
    default:
      return save.character.stats.wits >= save.character.stats.spirit ? 'wits' : 'spirit'
  }
}

export function rollCheck(save: SaveState, world: World, stat: StatKey, dcOffset = 0): RollResult {
  const equipBonus = save.inventory
    .filter((i) => save.equipped.includes(i.key) && i.bonus)
    .reduce((acc, i) => {
      const b = i.bonus!
      let v = 0
      if (b.stat === stat) v += b.value ?? 0
      if (b.extra && stat in b.extra) v += b.extra[stat] ?? 0
      return acc + v
    }, 0)
  const diff = { Story: -2, Balanced: 0, Brutal: 2 }[world.difficulty]
  const dc = clamp(12 + diff + dcOffset, 6, 19)
  const die = dice(20)
  const mod = statMod(save.character.stats[stat]) + equipBonus
  const total = die + mod
  const success = total >= dc || die === 20
  return {
    stat,
    die,
    mod,
    total,
    dc,
    success,
    crit: die === 20 ? 'success' : die === 1 ? 'fail' : null,
  }
}

type Ctx = {
  location: WorldLocation
  npcsHere: WorldNpc[]
  mentionsNpc: WorldNpc[]
  hero: string
}

const BANK: Record<string, string[]> = {
  'attack:great': [
    '{H} moves with terrible clarity. The strike lands exactly where it should; {S} staggers, and for a moment the {L} holds still — the whole place leans in to watch.',
    'The opening appears, and {H} does not waste it. The blow connects. {S} gives ground, staggered and suddenly careful.',
    'It is ugly, fast, and over quickly. {H} wins the exchange, breathing hard, and the {L} rewards the victor with silence.',
  ],
  'attack:good': [
    '{H} presses the fight and makes it count. {S} is driven back a pace, hurt but not beaten, and neither of them is who they were a minute ago.',
    '{H} commits. It is not clean — nothing here is — but {S} takes the hit and the battle lines are drawn.',
  ],
  'attack:miss': [
    '{H} commits — badly. {S} anticipated it, slips the attempt, and answers with something that costs {H} skin and pride.',
    'The strike goes wide. For a heartbeat nothing happens. Then {S} demonstrates why patience is a weapon too.',
  ],
  'attack:bad': [
    '{H} attacks with everything and lands with nothing. The rebuff is casual, almost kind, and it costs {H} dearly.',
    'It is over fast and it is over badly. {H} staggers back, and the {L} offers no sympathy at all.',
  ],
  'social:great': [
    '{H} chooses exactly the right words. Suspicion gives way to something warmer, more dangerous: a door that was closed opens a little.',
    'It works beautifully. {S} heard what they needed to hear, and answers in kind. Even the {L} draws a quieter breath.',
    '{H} gives {S} what they wanted and did not know how to ask for. The conversation now belongs to {H}.',
  ],
  'social:good': [
    '{H} talks, and {S} listens. Not a pact — a beginning, and both of them know it.',
    'The conversation costs effort and returns something real. {S} softens by a degree and gives careful ground.',
  ],
  'social:miss': [
    '{H}’s words land wrong. {S}’s face closes like a shop shutter, and the moment passes.',
    '{S} listens politely and believes none of it. The pitch will not land today.',
  ],
  'stealth:great': [
    '{H} becomes furniture. No glance trails, no head turns — {H} moves through the {L} like a rumor and leaves without a ripple.',
    'Silk-quiet. {H} moves only when the air moves, and hears what was not meant for them.',
  ],
  'stealth:good': [
    '{H} is nearly perfect — one board creaks that will always be a mystery. Nobody seems to have noticed. Probably.',
  ],
  'stealth:miss': [
    'A small sound, then a long waiting silence with eyes in it. {H}’s passage has a witness.',
    '{H} is unseen for ninety percent of the approach; the last ten percent is where everything happens at once.',
  ],
  'investigate:great': [
    '{H} reads the {L} the way others read handwriting — quickly, without asking permission. A detail burrows in and rewrites the whole scene.',
    'A seam in the {L}, nearly invisible, opens like a page. The pattern beneath is not accidental.',
  ],
  'investigate:good': [
    '{H} studies the {L} and pulls something useful from it: a stain, a scar, a story the walls were asked to keep.',
    'Patience pays. Not everything, but enough: {H} learns a true thing, small and load-bearing.',
  ],
  'investigate:miss': [
    '{H} looks until looking stops helping. The {L} keeps its private grammar for now.',
    'Wear, dust, intent — the ordinary. The secret, if there is one, is keeping.',
  ],
  'arcane:great': [
    'The old powers are listening tonight. Something vast and courteous grants {H} a measure of attention, and the {L} bends — slightly, and forever.',
    '{H} reaches, and is touched back. The air sharpens; truths rise like fish to a morning surface.',
  ],
  'arcane:good': [
    '{H} reaches out, and something out there considers the request. The answer is small, real, and slightly dislocated.',
    '{H} meditates. The {L} answers in its sleep: a fragment, a heat, an inkling.',
  ],
  'arcane:miss': [
    'Nothing answers, or nothing admits to answering. {H} is left with a headache shaped like a question.',
    'Something hears — and declines. {H} gets the distinct sense of being measured, found tolerable rather than urgent.',
  ],
  'travel:good': [
    'Distance is a negotiation, and {H} wins today\u2019s round — arriving dusty, cautious, and better informed.',
  ],
  'travel:miss': [
    'The way is not open — not with these provisions, not in this weather, not today.',
    'The path loops, the weather objects, and {H} ends the day exactly where it began, minus a little blood.',
  ],
  'explore:great': [
    'A turn, a threshold, and the {L} opens one of its private doors. {H} steps through.',
    '{H} moves deeper, and the {L} — which rewards the curious — unfolds a passage that was in no brochure.',
  ],
  'explore:good': [
    '{H} wanders. Most of it is surface; a little of it is not. They pocket the part that is not.',
    '{H} prowls the {L}, and the place offers something marginal and true.',
  ],
  'explore:miss': [
    '{H} circles the edges of the {L} and comes up with the ordinary. The interesting thing keeps its seat.',
  ],
}

const REST_LINES = [
  '{H} stops moving and lets the world move instead. It is, for once, allowed.',
  'Somewhere between one breath and the next, the place decides not to kill {H} for an hour.',
  '{H} rests in the lee of something old — which watches, in the indifferent way of old things.',
]

const SOCIAL_LINES: Record<string, string[]> = {
  friendly: [
    '“You are either very brave or very lost. I can help with both, slightly.”',
    '“Some people arrive and take things. You arrive and ask questions. I like you.”',
  ],
  neutral: [
    '“I did not come here to be known. But you found me anyway — so, fine. Ask.”',
    '“Everyone wants something. You seem more interesting about it than most.”',
  ],
  wary: [
    '“I have been patient with clever people before. It went poorly. Why are you different?”',
    '“I will answer one thing. Choose the question carefully, and do not waste me.”',
  ],
  hostile: [
    '“You are speaking. That is the last mistake you get to make with confidence.”',
    '“Words. Very good. They have never once stopped me. Speak fast.”',
  ],
}

function dropThe(name: string): string {
  return name.replace(/^The\s+/i, '')
}

function fill(template: string, ctx: Ctx): string {
  const npc = ctx.mentionsNpc[0] ?? ctx.npcsHere[0]
  const subjectName = npc ? npc.name : pick(['the dark', 'someone patient', 'the trouble at hand'])
  return template
    .replaceAll('the {L}', `the ${dropThe(ctx.location.name)}`)
    .replaceAll('the {S}', `the ${dropThe(subjectName)}`)
    .replaceAll('{H}', ctx.hero)
    .replaceAll('{S}', subjectName)
    .replaceAll('{L}', ctx.location.name)
}

function findNpcsHere(world: World, locId: string): WorldNpc[] {
  return world.npcs.filter((n) => n.locationId === locId)
}

function findMentions(world: World, text: string): WorldNpc[] {
  const t = text.toLowerCase()
  return world.npcs.filter((n) => {
    const tokens = n.name
      .toLowerCase()
      .split(' ')
      .filter((w) => w !== 'the' && w.length > 2)
    return tokens.some((w) => t.includes(w))
  })
}

function findMentionedLocation(world: World, text: string): WorldLocation | undefined {
  const t = text.toLowerCase()
  return (
    world.locations.find((l) => t.includes(l.name.toLowerCase())) ??
    world.locations.find((l) => t.includes(l.name.toLowerCase().split(' ').slice(-1)[0]))
  )
}

function block(save: SaveState, kind: StoryBlock['kind'], text: string, extra?: Partial<StoryBlock>) {
  const b: StoryBlock = { id: uid('b'), kind, text, at: Date.now(), ...extra }
  save.story.push(b)
  save.lastLine = text.slice(0, 140)
}

function journal(save: SaveState, entry: Omit<JournalEntry, 'id' | 'turn'>) {
  save.journal.unshift({ ...entry, id: uid('j'), turn: save.turn })
}

function grantXp(save: SaveState, amount: number): string | null {
  save.xp += amount
  const need = save.level * 120
  if (save.xp >= need) {
    save.xp -= need
    save.level += 1
    save.maxHp += 4
    save.hp = save.maxHp
    return `Level up — ${save.level}! HP restored.`
  }
  return null
}

function grantItem(save: SaveState, world: World, itemId: string) {
  const tpl = world.items.find((i) => i.id === itemId)
  if (!tpl) return ''
  const owned = save.inventory.find((i) => i.templateId === tpl.id)
  if (owned) owned.qty += 1
  else save.inventory.push({ ...tpl, key: uid('item'), qty: 1 } as InventoryItem)
  return tpl.name
}

export interface TurnResult {
  leveled: string | null
  questMsg: string | null
  lootMsg: string | null
}

export function takeTurn(save: SaveState, world: World, rawAction: string): TurnResult {
  const action = rawAction.trim()
  const loc = world.locations.find((l) => l.id === save.locationId) ?? world.locations[0]
  if (!save.visited.includes(loc.id)) save.visited.push(loc.id)
  const ctx: Ctx = {
    location: loc,
    npcsHere: findNpcsHere(world, loc.id),
    mentionsNpc: findMentions(world, action),
    hero: save.character.name,
  }
  save.turn += 1
  block(save, 'player', action)

  const intent = intentOf(action)
  let leveled: string | null = null
  let questMsg: string | null = null
  let lootMsg: string | null = null
  const activeQuest = () => save.quests.find((q) => q.status === 'active')

  const advanceQuest = (amount: number) => {
    const q = activeQuest()
    if (!q) return
    q.progress += amount
    if (q.progress >= 3) {
      q.status = 'complete'
      save.gold += q.rewardGold
      leveled = grantXp(save, q.rewardXp) ?? leveled
      let reward = ''
      if (q.itemId) reward = grantItem(save, world, q.itemId)
      questMsg = `Quest complete — ${q.title}` + (reward ? ` · gained ${reward}` : ` · +${q.rewardXp} XP`)
      block(save, 'quest', questMsg)
      journal(save, { title: `Quest complete: ${q.title}`, text: q.objective, kind: 'quest' })
    } else {
      questMsg = `Progress — ${q.title} (${q.progress}/3)`
      block(save, 'quest', questMsg)
    }
  }

  if (intent === 'rest') {
    const heal = Math.min(3 + dice(8), save.maxHp - save.hp)
    save.hp += heal
    block(save, 'narration', fill(pick(REST_LINES), ctx))
    if (heal > 0) block(save, 'system', `Rested · restored ${heal} HP`)
  } else if (intent === 'item') {
    const match = save.inventory.find((i) => action.toLowerCase().includes(i.name.toLowerCase()))
    if (match) {
      if (match.bonus?.heal) save.hp = clamp(save.hp + match.bonus.heal, 0, save.maxHp)
      if (match.kind === 'consumable') {
        match.qty -= 1
        if (match.qty <= 0) save.inventory = save.inventory.filter((i) => i.key !== match.key)
      }
      block(save, 'narration', pick([
        `You put the ${match.name.toLowerCase()} to work — ${match.description.toLowerCase()} It behaves, then better than it promised.`,
        `The ${match.name.toLowerCase()} comes out of the kit and does its job. ${loc.name} adjusts around the consequences.`,
      ]))
    } else {
      block(save, 'narration', 'You reach for something that is not there. The kit stays stubbornly honest about its contents.')
    }
  } else if (intent === 'flee') {
    const back = world.locations[Math.max(0, world.locations.indexOf(loc) - 1)]
    save.locationId = back.id
    block(save, 'system', `Escaped to ${back.name}`)
    block(save, 'narration', pick([
      `${ctx.hero} leaves quickly, without dignity, and with all limbs intact. The ${ctx.location.name} allows it.`,
      'Discretion performs its midday feat. Alive beats proud, every time it is tried.',
    ]))
  } else if (intent === 'travel') {
    const dest =
      findMentionedLocation(world, action) ??
      pick(world.locations.filter((l) => l.id !== loc.id))
    const roll = rollCheck(save, world, statFor('travel', save), dest.kind === 'dungeon' ? 2 : 0)
    block(save, 'check', checkText(roll, 'Travel'), { roll })
    if (roll.success) {
      save.locationId = dest.id
      if (!save.visited.includes(dest.id)) save.visited.push(dest.id)
      if (!save.discovered.includes(dest.id)) {
        save.discovered.push(dest.id)
        journal(save, { title: `Discovered: ${dest.name}`, text: dest.description, kind: 'discovery' })
      }
      block(save, 'narration', pick([
        `Distance is a negotiation, and ${ctx.hero} wins today's round. ${dest.name} — ${dest.description}`,
        `The road does what roads do: remembers. ${dest.name} rises to meet the day. ${dest.description}`,
      ]))
      if (Math.random() < 0.5) advanceQuest(1)
    } else {
      save.hp = clamp(save.hp - dice(4), 1, save.maxHp)
      block(save, 'narration', pick([
        `The world declines. ${dest.name} stays where it is, and so — briefly, bleeding a little — does ${ctx.hero}.`,
        `The terrain votes no. ${ctx.hero} turns back with a small tax paid in skin.`,
      ]))
    }
  } else {
    const stat = statFor(intent, save)
    const risky: Intent[] = ['attack', 'stealth', 'arcane', 'explore']
    const roll = rollCheck(save, world, stat, risky.includes(intent) ? 1 : 0)
    const tier: 'great' | 'good' | 'miss' | 'bad' =
      roll.crit === 'fail'
        ? 'bad'
        : roll.success
          ? roll.die >= 16 || roll.crit === 'success'
            ? 'great'
            : 'good'
          : roll.total <= roll.dc - 5
            ? 'bad'
            : 'miss'
    block(save, 'check', checkText(roll, labelFor(intent)), { roll })
    block(save, 'narration', fill(pick(BANK[`${intent}:${tier}`] ?? BANK[`explore:${tier}`] ?? BANK['explore:good']), ctx))

    if (intent === 'social' && (ctx.mentionsNpc[0] ?? ctx.npcsHere[0])) {
      const npc = ctx.mentionsNpc[0] ?? ctx.npcsHere[0]
      const delta = tier === 'great' ? 12 : tier === 'good' ? 6 : tier === 'miss' ? -4 : -10
      save.relationships[npc.id] = clamp((save.relationships[npc.id] ?? 0) + delta, -100, 100)
      if (tier === 'great' || tier === 'good') {
        block(save, 'dialogue', pick(SOCIAL_LINES[npc.disposition] ?? SOCIAL_LINES.neutral), { speaker: npc.name })
      }
      if (tier === 'great' && npc.secret && Math.random() < 0.6) {
        block(save, 'dialogue', `“Between us — ${npc.secret}”`, { speaker: npc.name })
        journal(save, { title: `${npc.name} trusts you a little`, text: npc.description, kind: 'relationship' })
      }
      if (tier !== 'bad') advanceQuest(1)
    } else if (risky.includes(intent)) {
      if (tier === 'miss' || tier === 'bad') {
        save.hp = clamp(save.hp - (tier === 'bad' ? dice(6) + 2 : dice(3)), 1, save.maxHp)
      } else {
        if (Math.random() < 0.40) {
          const tpl = pick(world.items)
          const owned = save.inventory.find((i) => i.templateId === tpl.id)
          if (owned) owned.qty += 1
          else save.inventory.push({ ...tpl, key: uid('item'), qty: 1 } as InventoryItem)
          const goldGain = dice(40)
          save.gold += goldGain
          lootMsg = `${tpl.name}${goldGain > 24 ? ` · plus ${goldGain} coins` : ''}`
          block(save, 'loot', `Found: ${lootMsg}`)
        }
        if (Math.random() < 0.6) advanceQuest(1)
        else leveled = grantXp(save, 16 + dice(16)) ?? leveled
      }
    } else {
      if (Math.random() < 0.5) advanceQuest(1)
      else leveled = grantXp(save, 12 + dice(10)) ?? leveled
    }
  }

  if (save.hp <= 1) {
    block(save, 'system', 'You are at death\u2019s door. Rest, flee, or tend your wounds.')
  }

  return { leveled, questMsg, lootMsg }
}

function labelFor(intent: Intent): string {
  switch (intent) {
    case 'attack':
      return 'Combat'
    case 'social':
      return 'Persuasion'
    case 'stealth':
      return 'Stealth'
    case 'investigate':
      return 'Insight'
    case 'arcane':
      return 'Will'
    case 'travel':
      return 'Travel'
    default:
      return 'Action'
  }
}

function checkText(roll: RollResult, label: string): string {
  return `${label} — ${roll.stat} ${roll.die}${roll.mod >= 0 ? '+' : ''}${roll.mod} vs ${roll.dc} → ${roll.total} · ${roll.success ? 'success' : 'failure'}`
}

export function suggestActions(save: SaveState, world: World): string[] {
  const loc = world.locations.find((l) => l.id === save.locationId) ?? world.locations[0]
  const here = findNpcsHere(world, loc.id)
  const q = save.quests.find((x) => x.status === 'active')
  const options: string[] = []
  if (here.length) options.push(`Speak with ${here[0].name} about ${pick(['this place', 'their work', 'the rumor', 'what they want'])}`)
  options.push(`Search ${loc.name} for clues`)
  const dests = world.locations.filter((l) => l.id !== loc.id)
  if (dests.length) options.push(`Travel toward ${pick(dests).name}`)
  if (q) options.push(`Work on “${q.title}”`)
  if (save.hp < save.maxHp) options.push('Rest and recover')
  options.push('Look for a hidden way forward')
  options.push('Examine your surroundings closely')
  const out: string[] = []
  for (const o of options) {
    if (!out.includes(o)) out.push(o)
    if (out.length === 3) break
  }
  return out
}

export function openingStory(save: SaveState, world: World): void {
  const loc = world.locations.find((l) => l.id === save.locationId) ?? world.locations[0]
  save.story = []
  block(save, 'system', `Your adventure in ${world.title} begins`)
  block(save, 'narration', world.opening)
  block(save, 'narration', `You stand in ${loc.name}. ${loc.description}`)
  const cast = findNpcsHere(world, loc.id)
  if (cast.length) {
    block(save, 'dialogue', pick(SOCIAL_LINES[cast[0].disposition] ?? SOCIAL_LINES.neutral), { speaker: cast[0].name })
  }
  const first = world.quests[0]
  if (first) {
    block(save, 'quest', `New quest — ${first.title}: ${first.hook}`)
    journal(save, { title: `Quest accepted: ${first.title}`, text: first.hook, kind: 'quest' })
  }
  save.visited = [loc.id]
  save.discovered = [loc.id]
}
