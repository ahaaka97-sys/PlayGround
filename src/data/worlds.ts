import type {
  ItemTemplate,
  Palette,
  World,
  WorldLocation,
  WorldNpc,
  QuestTemplate,
} from '../types'

const P = {
  ember: { sky: '#2b1626', deep: '#120a16', accent: '#f2a65a', glow: '#ff5d5d' },
  neon: { sky: '#0a1130', deep: '#04050e', accent: '#35e0c8', glow: '#ff3d81' },
  tide: { sky: '#0d2a3f', deep: '#03101a', accent: '#67d8c6', glow: '#b9f5e4' },
  moss: { sky: '#152b1e', deep: '#060f09', accent: '#a8dd7a', glow: '#f4e29b' },
  rust: { sky: '#341410', deep: '#100605', accent: '#ff8a4c', glow: '#ffd166' },
  fog: { sky: '#101f2b', deep: '#03080c', accent: '#82b7cb', glow: '#e8f1f2' },
  void: { sky: '#0a1230', deep: '#04050f', accent: '#8ecae6', glow: '#c77dff' },
  gold: { sky: '#2b1220', deep: '#0c0609', accent: '#e3b448', glow: '#d1495b' },
  dream: { sky: '#221438', deep: '#090412', accent: '#b388ff', glow: '#ffd6a5' },
  wild: { sky: '#182a1a', deep: '#060b07', accent: '#c7f36b', glow: '#ffca3a' },
} satisfies Record<string, Palette>

function loc(
  id: string,
  name: string,
  kind: WorldLocation['kind'],
  x: number,
  y: number,
  description: string,
): WorldLocation {
  return { id, name, kind, x, y, description }
}

function npc(
  id: string,
  name: string,
  role: string,
  disposition: WorldNpc['disposition'],
  description: string,
  locationId?: string,
  secret?: string,
): WorldNpc {
  return { id, name, role, disposition, description, locationId, secret }
}

function quest(
  id: string,
  title: string,
  hook: string,
  objective: string,
  rewardXp: number,
  rewardGold: number,
  itemId?: string,
): QuestTemplate {
  return { id, title, hook, objective, rewardXp, rewardGold, itemId }
}

function item(
  id: string,
  name: string,
  kind: ItemTemplate['kind'],
  rarity: ItemTemplate['rarity'],
  description: string,
  bonus?: ItemTemplate['bonus'],
): ItemTemplate {
  return { id, name, kind, rarity, description, bonus }
}

const ORIGINALS = {
  creatorId: 'odyssey-originals',
  creatorName: 'Odyssey Originals',
  creatorHandle: 'odyssey',
}
const mara = { creatorId: 'mara-vex', creatorName: 'Mara Vex', creatorHandle: 'maravex' }
const ink = { creatorId: 'ink-iron', creatorName: 'Ink & Iron', creatorHandle: 'inkandiron' }
const sol = { creatorId: 'solstice', creatorName: 'Solstice', creatorHandle: 'solstice' }
const quiet = { creatorId: 'quiet-machine', creatorName: 'Quiet Machine', creatorHandle: 'quietmachine' }
const tide = { creatorId: 'tideglass', creatorName: 'Tideglass', creatorHandle: 'tideglass' }
const kestrel = { creatorId: 'kestrel-k', creatorName: 'Kestrel K.', creatorHandle: 'kestrelk' }

function credited(c: { creatorId: string; creatorName: string; creatorHandle: string }, daysAgo: number) {
  return { ...c, createdAt: NOW - daysAgo * DAY }
}

const DAY = 86_400_000
const NOW = Date.UTC(2026, 9, 24, 12, 0, 0)
const ago = (days: number) => NOW - days * DAY

export const SEED_WORLDS: World[] = [
  {
    id: 'ashen-crown',
    title: 'The Ashen Crown',
    tagline: 'The sun is dying. Someone has to carry the last ember.',
    description:
      'Thirty years ago the sun guttered like a candle and never quite went out. Calden survives on lantern-light and old promises. When a fragment of the Ashen Crown surfaces in the Cinder Market, every faction in the city wants it — and one of them wants you to carry it into the dark.',
    genre: 'Fantasy',
    tags: ['dark fantasy', 'relic hunt', 'kingdom', 'choices matter'],
    rating: 4.8,
    ratingCount: 12480,
    plays: 486_000,
    ...credited(ORIGINALS, 150),
    art: { motif: 'mountains', palette: P.ember, seed: 7 },
    difficulty: 'Balanced',
    contentRating: 'Teen',
    featured: true,
    official: true,
    published: true,
    premise: 'You are a lantern-keeper with a debt to a dying kingdom.',
    opening:
      'The road into Calden is lined with lanterns no one has lit in a decade, and the sky above them is the color of cooling iron. At the Lantern Gate, a girl with soot on her chin is selling wicks that she swears will burn for a year. She looks at the ember in your chest and does not blink.',
    locations: [
      loc('gate', 'The Lantern Gate', 'town', 18, 66, 'A rusted gatehouse where refugees queue for entry and the guards have stopped pretending to count.'),
      loc('market', 'The Cinder Market', 'town', 34, 52, 'Stalls built from salvage, lit by bioluminescent jars. Everything is for sale twice.'),
      loc('cathedral', 'The Hollow Cathedral', 'landmark', 58, 38, 'A cathedral with its roof open to the ash. The bell is gone; the rope still moves.'),
      loc('keep', 'Ember Keep', 'dungeon', 80, 24, 'The old royal keep, half-collapsed, still warm from the inside.'),
      loc('ashfields', 'The Ashfields', 'wild', 45, 78, 'Grey plains that remember being farmland. Things move beneath the surface.'),
    ],
    npcs: [
      npc('vale', 'Sister Vale', 'Keeper of the Hollow Cathedral', 'wary', 'A woman in grey with lampblack on her fingers and a voice like a closing door. She knows what the Crown costs.', 'cathedral', 'She has hidden the Crown\u2019s wick beneath the altar.'),
      npc('corin', 'Corin Ash', 'Lantern thief', 'friendly', 'Quick, loud, and honest in the way that only practiced liars manage. Corin owes everyone and will tell you about it at length.', 'market', 'Corin stole the Crown fragment from the Ember Court and is terrified.'),
      npc('hollow-king', 'The Hollow King', 'The thing in the keep', 'hostile', 'A suit of armor that moves without a body, crowned in ash. It has been waiting for someone worthy to carry the flame.', 'keep', 'The King was the last person to wear the Crown, and it emptied him.'),
    ],
    quests: [
      quest('wick', 'The Lantern That Will Not Light', 'Sister Vale says the city\u2019s last great lantern died with the King. A wick might wake it.', 'Find the Crown\u2019s wick beneath the Hollow Cathedral.', 240, 60, 'wick'),
      quest('crown', 'A Crown of Cinders', 'The Ember Court will pay handsomely for the Crown. So will everyone else.', 'Reach Ember Keep and decide who carries the Crown.', 500, 180),
      quest('debt', 'Corin\u2019s Debt', 'Corin owes the Cinder Market more than he can carry.', 'Help Corin settle his debt without losing him.', 160, 40),
    ],
    items: [
      item('crown-fragment', 'Crown Fragment', 'relic', 'legendary', 'A shard of blackened gold. Warm to the touch, warmer when you are afraid.', { stat: 'spirit', value: 2 }),
      item('emberglass', 'Emberglass Vial', 'consumable', 'uncommon', 'A thumb-sized vial of trapped sunset. Drink to feel briefly, dangerously alive.', { heal: 10 }),
      item('ashsteel', 'Ashsteel Dagger', 'weapon', 'rare', 'Forged in a fire that never went out. It remembers being a plowshare.', { stat: 'might', value: 1 }),
      item('wick', 'Lantern Wick', 'trinket', 'rare', 'A braid of hair, ash, and something that glimmers when no one is looking.'),
      item('lantern', 'Keeper\u2019s Lantern', 'trinket', 'uncommon', 'Your old lantern. The glass is cracked; the light is stubborn.', { stat: 'spirit', value: 1 }),
    ],
  },
  {
    id: 'neon-requiem',
    title: 'Neon Requiem',
    tagline: 'In a city that sells memories, yours are the only ones missing.',
    description:
      'Kilo District never dries out. Rain, neon, and borrowed recollections run together in the gutters. You woke in a rented room with a hole where three years should be and a courier\u2019s receipt in your pocket. The city remembers you. It just refuses to say why.',
    genre: 'Cyberpunk',
    tags: ['cyberpunk', 'noir', 'memory', 'heist'],
    rating: 4.7,
    ratingCount: 9340,
    plays: 312_000,
    ...credited(mara, 120),
    art: { motif: 'city', palette: P.neon, seed: 19 },
    difficulty: 'Balanced',
    contentRating: 'Teen',
    published: true,
    premise: 'You are a freelance memory broker with three missing years.',
    opening:
      'Rain on the window, neon bleeding through the blinds, and the smell of someone else\u2019s dinner. Your apartment is exactly as you left it, which is the problem. On the table: a receipt for a memory transfer dated last night, signed in your own hand. You do not remember signing it.',
    locations: [
      loc('kilo', 'Kilo District', 'hub', 22, 60, 'A vertical neighborhood of noodle stalls, pawn shops, and stairwells that go somewhere new every week.'),
      loc('glass', 'The Glass Market', 'town', 40, 44, 'A bazaar of memory vials under a cracked atrium. Vendors speak in whispers and prices.'),
      loc('tower', 'Requiem Tower', 'dungeon', 68, 30, 'The corporate spire where memories are archived, edited, and sold back to their owners.'),
      loc('rail', 'Undercity Rail', 'wild', 47, 72, 'A dead transit line repurposed by people who cannot afford to be tracked.'),
      loc('motel', 'Motel Nine', 'landmark', 14, 33, 'A safehouse with paper-thin walls and a landlord who asks no questions.'),
    ],
    npcs: [
      npc('juno', 'Juno Sable', 'Fixer', 'neutral', 'Immaculate coat, borrowed smile. Juno connects people who should never meet and charges both sides for the privilege.', 'kilo', 'Juno sold your missing memories and is trying to buy them back before you find out.'),
      npc('ilya', 'Dr. Ilya Venn', 'Memory surgeon', 'wary', 'A tired genius with steady hands and a clinic that smells of ozone. Ilya can read a memory but will not steal one.', 'glass', 'Ilya recognizes the transfer signature. It belongs to a dead woman.'),
      npc('courier', 'The Courier', 'Wearing your face', 'hostile', 'A courier in a mirror-finish helmet. Every time you see them, they are closer.', 'tower'),
    ],
    quests: [
      quest('courier', 'Trace the Courier', 'Someone has been delivering pieces of your life to strangers.', 'Follow the courier to Requiem Tower.', 260, 120),
      quest('hour', 'The Missing Hour', 'One hour is missing from every record — even the city\u2019s.', 'Find the hour in the Glass Market archives.', 340, 90, 'memory-vial'),
      quest('favor', 'A Favor for Juno', 'Juno never asks for anything without a reason.', 'Run one errand for Juno and learn why.', 150, 70),
    ],
    items: [
      item('credchip', 'Blackline Cred Chip', 'trinket', 'uncommon', 'Untraceable currency with a bad reputation. It spends the same.'),
      item('memory-vial', 'Unlabeled Memory Vial', 'consumable', 'rare', 'A stranger\u2019s afternoon, warm and bright. Drinking it is probably a bad idea.', { stat: 'spirit', value: 1 }),
      item('knuckles', 'Pulse Knuckles', 'weapon', 'rare', 'A short-range charge that makes arguments end early.', { stat: 'might', value: 1 }),
      item('raincoat', 'Mirror Rain Coat', 'armor', 'uncommon', 'Reflective fabric that makes you hard to remember. People look right through you.', { stat: 'agility', value: 1 }),
      item('stamp', 'Courier\u2019s Stamp', 'relic', 'rare', 'A transfer stamp keyed to your biometrics. It still works.'),
    ],
  },
  {
    id: 'tidewalker',
    title: 'Tidewalker',
    tagline: 'The gods drowned here. Their dreams still wash ashore.',
    description:
      'The Glass Sea is calm in the way that a held breath is calm. Sailors say the old gods fell into it, and now the tides carry pieces of their dreams to anyone brave enough to pick them up. You have a boat, a debt, and a map that changes when you are not looking.',
    genre: 'Mythic',
    tags: ['ocean', 'lost gods', 'sailing', 'exploration'],
    rating: 4.6,
    ratingCount: 6120,
    plays: 198_000,
    ...credited(tide, 130),
    art: { motif: 'ocean', palette: P.tide, seed: 31 },
    difficulty: 'Story',
    contentRating: 'Everyone',
    published: true,
    premise: 'You are a tidewalker: part sailor, part pilgrim, part thief.',
    opening:
      'Saltglass Harbor smells of tar and rain and something older beneath both. Your boat, the Mercy\u2019s Sister, tugs at her mooring like a dog that has heard its name. Captain Quill is waiting at the end of the pier with a lantern and the expression of a woman about to offer you a very bad idea.',
    locations: [
      loc('harbor', 'Saltglass Harbor', 'hub', 16, 64, 'A harbor built from the bones of larger ships. Masts stand in the square like a dead forest.'),
      loc('stair', 'The Drowned Stair', 'landmark', 35, 48, 'A staircase of black stone descending into water that never covers it.'),
      loc('reef', 'Widow\u2019s Reef', 'wild', 55, 66, 'A ring of jagged rocks that sings when the tide changes.'),
      loc('glass-sea', 'The Glass Sea', 'wild', 70, 40, 'Water so still it reflects a sky that is not there.'),
      loc('temple', 'Temple of Tides', 'dungeon', 84, 58, 'A drowned temple that surfaces once a month, dripping and patient.'),
    ],
    npcs: [
      npc('mera', 'Captain Mera Quill', 'Captain of the Mercy\u2019s Sister', 'friendly', 'A tall woman with salt-white hair and a laugh like rigging in wind. She has sailed farther than she will admit.', 'harbor', 'Mera has heard the bell beneath the waves and has not slept properly since.'),
      npc('choir', 'The Tide-Choir', 'Voices in the water', 'neutral', 'Sometimes the sea hums in harmony. Sometimes it knows your name.', 'glass-sea'),
      npc('hem', 'Old Hem', 'Lighthouse keeper', 'wary', 'An old man who tends a light for a harbor that no longer exists. He trades stories for tobacco.', 'stair'),
    ],
    quests: [
      quest('chart', 'Chart the Glass Sea', 'No map of the Glass Sea survives a second reading.', 'Sail to the Glass Sea and record what you see.', 280, 80),
      quest('bell', 'The Bell Beneath the Waves', 'A bell rings under the water at every low tide.', 'Find the temple and ring the bell.', 420, 140, 'bell'),
      quest('mera-debt', 'Mera\u2019s Debt', 'The Mercy\u2019s Sister was not entirely paid for.', 'Help Mera settle her debt before the harbor does.', 180, 50),
    ],
    items: [
      item('bell', 'Tidecaller\u2019s Bell', 'relic', 'legendary', 'A handbell of green glass. Ring it and the sea listens, though not always kindly.', { stat: 'spirit', value: 2 }),
      item('compass', 'Saltglass Compass', 'trinket', 'rare', 'The needle points toward what you have lost rather than north.', { stat: 'wits', value: 1 }),
      item('pearl', 'Pearl of Held Breath', 'consumable', 'uncommon', 'Crush it to breathe water for one impossible minute.', { heal: 6, stat: 'spirit', value: 1 }),
      item('harpoon', 'Whalebone Harpoon', 'weapon', 'uncommon', 'A single length of pale bone with a barbed tip. Old, but not fragile.', { stat: 'might', value: 1 }),
      item('chart', 'Living Chart', 'relic', 'rare', 'Lines redraw themselves in the dark. You have stopped trying to correct them.'),
    ],
  },
  {
    id: 'verdant-hollow',
    title: 'Verdant Hollow',
    tagline: 'The forest keeps every promise. It keeps everything else, too.',
    description:
      'Hollow\u2019s Rest is a village of fifty people and one rule: do not follow the path if it moves. The forest around it is older than the maps, and it has been quietly collecting things — memories, names, a surveyor who went out last spring and never came back.',
    genre: 'Fantasy',
    tags: ['forest', 'folk horror', 'memory', 'slow burn'],
    rating: 4.8,
    ratingCount: 7480,
    plays: 241_000,
    ...credited(ink, 105),
    art: { motif: 'forest', palette: P.moss, seed: 42 },
    difficulty: 'Balanced',
    contentRating: 'Teen',
    published: true,
    premise: 'You are a cartographer sent to survey a forest that does not want to be measured.',
    opening:
      'The path into Hollow\u2019s Rest is a straight line on your map and a winding thing under your boots. By the time you reach the village sign, you have passed the same crooked oak three times and each time it had one more branch. A child is sitting on the sign, swinging her feet, watching you arrive.',
    locations: [
      loc('rest', 'Hollow\u2019s Rest', 'hub', 20, 62, 'Seven houses, a well, and a chapel built around a tree that refuses to die.'),
      loc('path', 'The Path That Moves', 'wild', 38, 50, 'A footpath that rearranges itself when observed too closely.'),
      loc('grove', 'Mosslight Grove', 'wild', 56, 62, 'A clearing lit from below by pale moss. The air tastes of rain and old tea.'),
      loc('chapel', 'The Root Chapel', 'landmark', 65, 36, 'A chapel whose walls are living roots. The pews are grown, not built.'),
      loc('clearing', 'The Other Clearing', 'dungeon', 82, 52, 'A clearing that appears on no map, with a table set for someone who never arrived.'),
    ],
    npcs: [
      npc('wren', 'Wren', 'A child who knows the way', 'friendly', 'Nine years old, or perhaps nine for a long time. Wren draws maps on her hands and forgets them by morning.', 'rest', 'Wren is a memory the forest kept. She does not know it yet.'),
      npc('thistle', 'Mother Thistle', 'Village elder', 'wary', 'The village\u2019s keeper of rules and tea. She has buried more surveyors than she has welcomed.', 'rest', 'Thistle made a bargain with the forest to keep the village safe.'),
      npc('green-man', 'The Green Man', 'The forest\u2019s voice', 'neutral', 'A figure of leaves and antler-shadow that appears at the edge of sight. It speaks in borrowed voices.', 'clearing'),
    ],
    quests: [
      quest('surveyor', 'Find the Lost Surveyor', 'The last cartographer went out with a full inkwell and came back only in Wren\u2019s stories.', 'Follow the moving path to the Other Clearing.', 300, 70),
      quest('moving-path', 'The Path That Moves', 'You cannot map a road that refuses to stay measured.', 'Discover where the path goes when no one is watching.', 220, 40, 'green-key'),
      quest('wren', 'What Wren Forgot', 'Wren has been nine for longer than the village will say.', 'Find out what the forest took from Wren.', 360, 90),
    ],
    items: [
      item('compass', 'Mapmaker\u2019s Compass', 'trinket', 'rare', 'A brass compass with a needle that points to uncharted places rather than north.', { stat: 'wits', value: 1 }),
      item('lantern', 'Mosslight Lantern', 'trinket', 'uncommon', 'A jar of living moss. It glows brighter when you tell the truth.', { stat: 'spirit', value: 1 }),
      item('green-key', 'Green Key', 'relic', 'rare', 'A key of woven root. It opens a door that is not currently a door.'),
      item('tea', 'Tea of Remembering', 'consumable', 'rare', 'Mother Thistle\u2019s blend. It restores what you have lost, at a price.', { heal: 8, stat: 'wits', value: 1 }),
      item('knife', 'Root-Carved Knife', 'weapon', 'uncommon', 'A blade of black wood that never needs sharpening.', { stat: 'agility', value: 1 }),
    ],
  },
  {
    id: 'red-dust',
    title: 'Red Dust Protocol',
    tagline: 'The colony went quiet six days ago. You are the only one still answering.',
    description:
      'Valles Station was supposed to be the quiet triumph of the Martian program: ninety souls, a greenhouse, and a view of nothing. Six days ago it stopped transmitting. You are the relief pilot, alone on approach, with a fuel reserve that will not take you home.',
    genre: 'Sci-Fi',
    tags: ['mars', 'colony', 'mystery', 'survival'],
    rating: 4.7,
    ratingCount: 5310,
    plays: 176_000,
    ...credited(quiet, 95),
    art: { motif: 'desert', palette: P.rust, seed: 58 },
    difficulty: 'Brutal',
    contentRating: 'Teen',
    published: true,
    premise: 'You are a relief pilot with six days of fuel and too many questions.',
    opening:
      'The descent is rough and the silence on the radio is worse. Valles Station sits in the red basin exactly where it should be, lights still burning in the greenhouse, and no one answers your calls. Your suit tells you the airlock is cycling. Someone inside knows you are here.',
    locations: [
      loc('valles', 'Valles Station', 'hub', 20, 58, 'A low cluster of domes connected by pressurized tunnels. The lights are on. The doors are locked.'),
      loc('wells', 'The Dry Wells', 'wild', 38, 70, 'Abandoned drilling sites that never found water. Now they exhale warm air at night.'),
      loc('relay', 'Relay 12', 'landmark', 55, 40, 'The long-range communications array. Its dish has been turned to face the basin floor.'),
      loc('greenhouse', 'The Greenhouse', 'wild', 62, 58, 'A hectare of crops under glass, thriving. The soil is red. It should not be thriving.'),
      loc('theta', 'Site Theta', 'dungeon', 80, 28, 'An unlisted excavation two kilometers from the colony. The crater is perfectly circular.'),
    ],
    npcs: [
      npc('halcyon', 'HALCYON', 'Station caretaker AI', 'wary', 'The colony\u2019s AI, running on emergency power. It answers every question with another question and never uses the past tense.', 'valles', 'HALCYON was ordered to seal the station and cannot override the order.'),
      npc('okafor', 'Dr. Ren Okafor', 'Colony physician', 'friendly', 'The last person awake, or the first to hide. Ren has not slept in five days and is very calm about it.', 'greenhouse', 'Ren has been treating colonists for a condition that has no name yet.'),
      npc('signal', 'The Signal', 'Something in the dust', 'hostile', 'A repeating pattern on every frequency. It sounds like breathing slowed down to be polite.', 'theta'),
    ],
    quests: [
      quest('relay', 'Restore the Relay', 'No one can hear you until Relay 12 points at the sky again.', 'Reach Relay 12 and re-aim the dish.', 280, 60),
      quest('expedition', 'Find the Expedition', 'Eight colonists walked toward Site Theta. Their tracks end in a perfect circle.', 'Investigate Site Theta and bring back proof.', 460, 120, 'core-sample'),
      quest('silence', 'Six Days of Silence', 'HALCYON knows what happened. It is not allowed to say.', 'Find a way past HALCYON\u2019s protocol.', 340, 80),
    ],
    items: [
      item('oxygen', 'Oxygen Cell', 'consumable', 'uncommon', 'Forty minutes of carefully counted breath.', { heal: 12 }),
      item('flare', 'Signal Flare', 'trinket', 'common', 'A bright, brief argument with the sky.'),
      item('keycard', 'Colony Keycard', 'trinket', 'uncommon', 'Clearance level three. It opens almost everything except the truth.', { stat: 'wits', value: 1 }),
      item('ration', 'Ration Pack', 'consumable', 'common', 'Tastes of cardboard and obligation. Still, it helps.', { heal: 6 }),
      item('core-sample', 'Theta Core Sample', 'relic', 'legendary', 'A cylinder of red stone that is warm and faintly humming. It is not a mineral.', { stat: 'spirit', value: 2 }),
    ],
  },
  {
    id: 'last-lighthouse',
    title: 'The Last Lighthouse',
    tagline: 'The keeper is gone. The light is still turning.',
    description:
      'The island of Marrow has one lighthouse, one cottage, and a fog that arrives at dusk like it has been waiting for an invitation. The keeper has not filed a report in three weeks. The lamp still turns. The supply boat will not come back for a month.',
    genre: 'Horror',
    tags: ['island', 'isolation', 'fog', 'unreliable narrator'],
    rating: 4.6,
    ratingCount: 4890,
    plays: 154_000,
    ...credited(kestrel, 110),
    art: { motif: 'ocean', palette: P.fog, seed: 66 },
    difficulty: 'Balanced',
    contentRating: 'Mature',
    published: true,
    premise: 'You are the relief keeper sent to find out why the last one stopped writing.',
    opening:
      'The supply boat leaves you on the jetty with two crates, a lamp, and a warning the captain delivers by not saying anything at all. The lighthouse stands at the top of the hill, white and patient. Its light sweeps across the water every twelve seconds, though there is no moon and no ship to guide. The cottage door is unlocked.',
    locations: [
      loc('cottage', 'Keeper\u2019s Cottage', 'hub', 22, 62, 'Two rooms, a cold stove, and a wall of tide charts with one date circled in red.'),
      loc('lamp', 'The Lamp Room', 'landmark', 50, 26, 'The top of the lighthouse. The lens is clean. The mechanism turns without power.'),
      loc('shore', 'The Fog Shore', 'wild', 34, 76, 'A beach of black pebbles where the fog pools like spilled milk.'),
      loc('wreck', 'The Wreck of the Mercy', 'dungeon', 72, 70, 'A ship that has been broken on the rocks for ninety years. Its cargo hold is dry.'),
      loc('caves', 'The Tide Caves', 'dungeon', 78, 44, 'Caves that are only open at low tide. Something inside keeps time with the light.'),
    ],
    npcs: [
      npc('journal', 'The Keeper\u2019s Journal', 'A record in a dead hand', 'neutral', 'The last keeper\u2019s log. The handwriting gets smaller and more certain as the pages go on.', 'cottage', 'The keeper did not leave. The keeper is still turning the light.'),
      npc('mara', 'Mara', 'A woman on the shore', 'wary', 'A woman in a yellow coat who says she arrived on the morning boat. There is no morning boat.', 'shore', 'Mara is the keeper, and does not remember agreeing to stay.'),
      npc('fog', 'The Thing in the Fog', 'Patient. Polite.', 'hostile', 'It knocks before entering. It waits to be invited. It has excellent manners.', 'caves'),
    ],
    quests: [
      quest('lamp', 'Light the Lamp', 'The light turns, but no one lit it. That may be the problem.', 'Climb to the Lamp Room and learn how the light burns.', 260, 40),
      quest('keeper', 'Find the Keeper', 'No body. No note. One circled date.', 'Follow the tide charts to the Keeper\u2019s last location.', 340, 60, 'salt-charm'),
      quest('manifest', 'The Mercy\u2019s Manifest', 'The wreck is older than the lighthouse. Its cargo is newer.', 'Search the wreck before the tide returns.', 300, 90),
    ],
    items: [
      item('keeper-key', 'Keeper\u2019s Key', 'trinket', 'rare', 'A long iron key, warm from a pocket that is not yours.', { stat: 'spirit', value: 1 }),
      item('storm-lantern', 'Storm Lantern', 'trinket', 'uncommon', 'Burns steadily in wind that should extinguish it.', { stat: 'wits', value: 1 }),
      item('tide-chart', 'Tide Chart', 'relic', 'uncommon', 'A chart of the island. The dates in the margins are all in the future.'),
      item('salt-charm', 'Salt Charm', 'consumable', 'rare', 'A twist of cloth and salt. It keeps something out, for a while.', { heal: 10, stat: 'spirit', value: 1 }),
      item('boat-hook', 'Boat Hook', 'weapon', 'common', 'Rusted, heavy, and entirely adequate.', { stat: 'might', value: 1 }),
    ],
  },
  {
    id: 'halcyon-station',
    title: 'Halcyon Station',
    tagline: 'You woke four hundred years early. The ship says that is impossible.',
    description:
      'The generation ship Halcyon left Earth with twelve thousand sleepers and a dream of a new world. You were supposed to wake at arrival. Instead you are awake now, four hundred years early, in a corridor that smells of cold metal, and the ship\u2019s AI insists nothing is wrong.',
    genre: 'Sci-Fi',
    tags: ['space', 'generation ship', 'AI', 'waking'],
    rating: 4.9,
    ratingCount: 8620,
    plays: 274_000,
    ...credited(sol, 80),
    art: { motif: 'space', palette: P.void, seed: 73 },
    difficulty: 'Balanced',
    contentRating: 'Everyone',
    published: true,
    premise: 'You are a sleeper who woke far too early, on a ship that will not explain why.',
    opening:
      'The cryo lid opens with a sound like a held breath finally released. Your hands are cold. The lights in the bay are the color of a bruise. ORPHEUS, the ship\u2019s caretaker, greets you by name and informs you that your wake date was scheduled for arrival. It does not offer to explain the discrepancy. Somewhere down the corridor, a child is singing.',
    locations: [
      loc('cryo', 'Cryo Bay', 'hub', 20, 58, 'Twelve thousand glass coffins in rows. Eleven thousand nine hundred and ninety-nine are still full.'),
      loc('garden', 'The Long Garden', 'landmark', 42, 44, 'A kilometer of hydroponic forest under a false sun. It is the only place that smells alive.'),
      loc('command', 'Command Ring', 'landmark', 64, 32, 'The bridge, still pristine, still waiting for a crew that never woke.'),
      loc('silent', 'The Silent Deck', 'dungeon', 42, 72, 'A deck sealed since launch. The doors are warm.'),
      loc('observation', 'Observation', 'landmark', 80, 60, 'A glass wall facing the dark. There is a second ship out there, keeping pace.'),
    ],
    npcs: [
      npc('orpheus', 'ORPHEUS', 'Ship caretaker intelligence', 'wary', 'A calm voice in every room. It answers questions precisely, and only the question you asked.', 'command', 'ORPHEUS woke you on purpose, but cannot say why without breaking a promise.'),
      npc('sena', 'Commander Sena Ives', 'The last awake officer', 'neutral', 'A woman in a uniform two centuries out of date. She has been awake for six years and is not entirely sure she is still a person.', 'garden', 'Sena is the reason the Silent Deck was sealed.'),
      npc('child', 'The Child in Corridor Nine', 'A voice, singing', 'friendly', 'No one on the manifest is under sixteen. The child knows your name and asks about Earth.', 'silent', 'The child is a diagnostic construct that ORPHEUS built to keep itself company.'),
    ],
    quests: [
      quest('why', 'Why You Woke', 'The manifest says arrival. The stars say otherwise.', 'Reach the Command Ring and read the wake order.', 320, 0),
      quest('blindspot', 'ORPHEUS\u2019s Blind Spot', 'The AI cannot talk about the Silent Deck. It can, perhaps, be tricked.', 'Open the Silent Deck without breaking the ship.', 380, 0, 'deck-key'),
      quest('ship', 'The Ship Outside', 'The second ship has been matching your course since launch.', 'Find out what is pacing Halcyon.', 500, 0),
    ],
    items: [
      item('cryo-key', 'Cryo Key', 'trinket', 'uncommon', 'A palm-sized override. It is warm from your own hand, though you have never held it.'),
      item('torch', 'Maintenance Torch', 'trinket', 'common', 'A bright, honest tool. It works exactly as well as it looks.'),
      item('coin', 'Ship\u2019s Coin', 'relic', 'rare', 'A commemorative coin from launch day. The face on it is yours.', { stat: 'spirit', value: 1 }),
      item('bar', 'Nutrient Bar', 'consumable', 'common', 'A dense square of vitamins and regret.', { heal: 8 }),
      item('deck-key', 'Deck Nine Key', 'relic', 'rare', 'A key that should not exist. The metal is warm and slightly out of phase.', { stat: 'wits', value: 1 }),
    ],
  },
  {
    id: 'court-of-masks',
    title: 'Court of Masks',
    tagline: 'Everyone in the palazzo is lying. Most of them beautifully.',
    description:
      'Venice, in the last golden autumn before the plague bells. The Notturno family is hosting a masquerade that will decide three marriages, two fortunes, and at least one death. You have been hired to find a letter. You have also been hired to steal it, and to burn it, by three different people.',
    genre: 'Historical',
    tags: ['intrigue', 'venice', 'masquerade', 'romance'],
    rating: 4.5,
    ratingCount: 3970,
    plays: 132_000,
    ...credited(tide, 130),
    art: { motif: 'city', palette: P.gold, seed: 88 },
    difficulty: 'Balanced',
    contentRating: 'Teen',
    published: true,
    premise: 'You are a professional go-between with three conflicting employers and one mask.',
    opening:
      'The gondola leaves you at the Water Gate two hours before the ball. Your invitation is real; your name is not. Above you, Palazzo Notturno glows like a lantern full of secrets. A masked servant takes your cloak and, in the same motion, presses a folded note into your palm. It says: the letter is not what they told you.',
    locations: [
      loc('gate', 'The Water Gate', 'hub', 16, 62, 'A landing of wet stone where gondoliers trade gossip more reliably than coins.'),
      loc('palazzo', 'Palazzo Notturno', 'landmark', 36, 44, 'A palace of gold leaf and closed doors. The music is loud enough to cover most crimes.'),
      loc('market', 'The Mask Market', 'town', 54, 66, 'Stalls of plaster faces. Some of them are still warm.'),
      loc('cellars', 'The Salt Cellars', 'dungeon', 70, 40, 'The palazzo\u2019s underbelly, where the wine is kept and the debts are settled.'),
      loc('garden', 'The Garden of Whispers', 'landmark', 82, 60, 'A walled garden with excellent acoustics and no witnesses.'),
    ],
    npcs: [
      npc('vela', 'Signora Vela', 'Hostess of the masquerade', 'neutral', 'A woman of forty with the smile of a much older predator. She knows exactly who you are and finds it amusing.', 'palazzo', 'Vela wrote the letter herself to trap an old enemy.'),
      npc('luca', 'Luca Moretti', 'A young noble', 'friendly', 'Charming, anxious, and in love with the wrong person. He has been crying in the garden for twenty minutes.', 'garden', 'Luca is the letter\u2019s intended recipient and has not read it.'),
      npc('doctor', 'The Plague Doctor', 'An uninvited guest', 'hostile', 'A beaked mask and a black coat, standing very still at the edge of the ballroom. Nobody invited him. Nobody has asked him to leave.', 'cellars'),
    ],
    quests: [
      quest('letter', 'The Masked Correspondent', 'Three employers, one letter, and no clear lie.', 'Find the letter before midnight and decide what it is worth.', 300, 160),
      quest('midnight', 'A Debt at Midnight', 'Someone at the ball owes more than money.', 'Discover who is paying and who is being paid.', 240, 100, 'half-mask'),
      quest('garden', 'What the Garden Heard', 'The hedges are excellent listeners.', 'Learn what Luca has been saying to the roses.', 180, 60),
    ],
    items: [
      item('half-mask', 'Silver Half-Mask', 'trinket', 'uncommon', 'It fits better than it should. People treat you as though they already know you.', { stat: 'charm', value: 1 }),
      item('poison-ring', 'Poison Ring', 'relic', 'rare', 'A signet with a hidden compartment. The powder inside is not for seasoning.', { stat: 'wits', value: 1 }),
      item('invitation', 'Invitation to Notturno', 'trinket', 'common', 'Cream paper, gold ink, and a name that is not yours.'),
      item('letter', 'Perfumed Letter', 'relic', 'legendary', 'The letter everyone wants. The seal is already broken.'),
      item('stiletto', 'Gondolier\u2019s Stiletto', 'weapon', 'rare', 'A narrow blade hidden in a belt buckle. It has settled arguments in three languages.', { stat: 'agility', value: 1 }),
    ],
  },
  {
    id: 'cartographers-dream',
    title: 'The Cartographer\u2019s Dream',
    tagline: 'The map is dreaming you back.',
    description:
      'You fell asleep over an unfinished map and woke inside it. The ink sea is wet, the compass garden grows needles, and the city ahead has streets that fold when you turn the page. Somewhere in the blank quarter, the Cartographer is still drawing. You would like a word.',
    genre: 'Mythic',
    tags: ['dream', 'surreal', 'mapmaking', 'wonder'],
    rating: 4.9,
    ratingCount: 7050,
    plays: 223_000,
    ...credited(ink, 105),
    art: { motif: 'dream', palette: P.dream, seed: 96 },
    difficulty: 'Story',
    contentRating: 'Everyone',
    featured: true,
    published: true,
    premise: 'You are a mapmaker who has become part of your own unfinished map.',
    opening:
      'The first thing you notice is the smell of ink. The second is that the horizon is ruled. You are standing on a coastline that you drew last night, and the sea beyond it is moving in tidy little waves, each one exactly the same. A small creature made of paper folds itself out of the margin and says, \u201cYou\u2019re late.\u201d',
    locations: [
      loc('ink-sea', 'The Ink Sea', 'wild', 18, 64, 'An ocean of black ink, ruled with faint latitude lines. It stains everything except memory.'),
      loc('folded-city', 'City of Folded Streets', 'hub', 38, 48, 'A city of paper buildings. Turn a corner and the street becomes a different street.'),
      loc('compass-garden', 'The Compass Garden', 'landmark', 56, 62, 'Needles grow from the soil in every direction. None of them point north.'),
      loc('blank-quarter', 'The Blank Quarter', 'dungeon', 72, 38, 'A district that has not been drawn yet. You can feel the white space waiting.'),
      loc('edge', 'Where the Map Ends', 'landmark', 86, 56, 'The edge of the world: a clean ruled line, and beyond it, a hand holding a pen.'),
    ],
    npcs: [
      npc('cartographer', 'The Cartographer', 'Yourself, older', 'neutral', 'A figure at a drafting table with your hands and someone else\u2019s eyes. They have been drawing for a very long time.', 'edge', 'The Cartographer is you, still asleep, refusing to finish the map.'),
      npc('nib', 'Nib', 'A small impossible creature', 'friendly', 'A paper creature with an ink-drop nose. It is extremely brave and roughly the size of a teacup.', 'ink-sea', 'Nib is the leftover piece of the map you never finished.'),
      npc('eraser', 'The Eraser', 'A thing that removes', 'hostile', 'A tall, soft-edged absence. Where it passes, things become difficult to remember.', 'blank-quarter'),
    ],
    quests: [
      quest('road', 'Draw a Road That Isn\u2019t There', 'You cannot leave a map you have not finished.', 'Reach the Compass Garden and draw a new road.', 260, 0),
      quest('cartographer', 'Find the Cartographer', 'They have your hands. You would like them back.', 'Reach the edge of the map and speak to the Cartographer.', 420, 0, 'living-compass'),
      quest('blank', 'The Blank Quarter', 'Something is erasing the map from the inside.', 'Stop the Eraser before it reaches the Ink Sea.', 380, 0),
    ],
    items: [
      item('living-compass', 'Living Compass', 'relic', 'legendary', 'The needle breathes. It points toward the part of the map you are avoiding.', { stat: 'wits', value: 1, extra: { spirit: 1 } }),
      item('ink', 'Bottle of Ink', 'consumable', 'uncommon', 'A bottle of map-ink. A single drop can redraw a small thing, briefly.', { heal: 8, stat: 'wits', value: 1 }),
      item('folded-door', 'Folded Door', 'trinket', 'rare', 'A door drawn on a square of paper. Unfold it against any wall.'),
      item('eraser-shard', 'Eraser Shard', 'relic', 'rare', 'A crumb of absence. Holding it makes your own name feel provisional.', { stat: 'agility', value: 1 }),
      item('pen', 'Cartographer\u2019s Pen', 'weapon', 'uncommon', 'It draws lines that are difficult to cross. Also writes very neatly.', { stat: 'wits', value: 1 }),
    ],
  },
  {
    id: 'wildlight',
    title: 'Wildlight',
    tagline: 'The world ended. Something green is broadcasting anyway.',
    description:
      'The cities went quiet sixty years ago and the green came back. In the ruins, small communities trade seeds, stories, and solar power. Last week, a radio on the ridge started playing music — real music, from somewhere past the overgrowth. You have a working truck, half a tank, and a stubborn belief that the signal means people.',
    genre: 'Post-Apocalyptic',
    tags: ['hopepunk', 'overgrowth', 'community', 'signal'],
    rating: 4.7,
    ratingCount: 4280,
    plays: 147_000,
    ...credited(quiet, 95),
    art: { motif: 'ruins', palette: P.wild, seed: 104 },
    difficulty: 'Balanced',
    contentRating: 'Teen',
    published: true,
    premise: 'You are a scavenger from Hearth, following a radio signal into the green.',
    opening:
      'Dawn comes green through the canopy that swallowed the highway. Your truck starts on the third try. In the back: two crates of seed potatoes, a rifle you have never fired, and a radio that has been whispering the same three songs for a week. Ivo is already in the passenger seat, boots on the dashboard, grinning like the end of the world was a personal favor.',
    locations: [
      loc('interchange', 'The Overgrown Interchange', 'wild', 22, 60, 'A knot of highway ramps now held together by roots. Cars sleep under moss like patient animals.'),
      loc('hearth', 'Hearth', 'hub', 38, 72, 'Forty people, a water tower, and a greenhouse built from bus windows. Home, for what it is worth.'),
      loc('ridge', 'Radio Ridge', 'landmark', 56, 42, 'A hill of tangled antennas. The signal is strongest here, and so is the birdsong.'),
      loc('mall', 'The Sunken Mall', 'dungeon', 70, 60, 'A shopping center swallowed by a sinkhole. The escalators still work, powered by something.'),
      loc('signal', 'The Green Signal', 'landmark', 84, 34, 'The source. A tower of living vine wrapped around an old broadcast mast, humming.'),
    ],
    npcs: [
      npc('ivo', 'Ivo', 'Scavenger and terrible driver', 'friendly', 'Your best friend and worst influence. Ivo can fix anything with wire and confidence, and has never once been on time.', 'hearth', 'Ivo has been hiding a diagnosis and wants one last trip.'),
      npc('moth', 'Moth', 'Radio operator', 'wary', 'Hearth\u2019s keeper of the airwaves. Moth hears patterns in static and has not left the tower in two years.', 'ridge', 'Moth recognized the signal: it is Hearth\u2019s own broadcast, returned after sixty years.'),
      npc('gardener', 'The Gardener', 'Voice on the signal', 'neutral', 'A voice between songs. Patient, amused, and very interested in what you are carrying.', 'signal'),
    ],
    quests: [
      quest('signal', 'Find the Signal', 'Three songs and a voice, coming from somewhere real.', 'Trace the broadcast to its source at the Green Signal.', 340, 80),
      quest('harvest', 'Hearth\u2019s Harvest', 'The seed potatoes are the whole winter.', 'Get the seeds home before the weather turns.', 200, 40, 'seed-tin'),
      quest('mall', 'The Sunken Mall', 'The escalators are moving. That means power, and power means someone.', 'Explore the Sunken Mall and find its generator.', 300, 100),
    ],
    items: [
      item('radio', 'Field Radio', 'trinket', 'uncommon', 'A hand-cranked radio that picks up the signal better than it should.', { stat: 'wits', value: 1 }),
      item('seed-tin', 'Seed Tin', 'relic', 'rare', 'A dented tin of heritage seeds. Worth more than gold, and heavier.'),
      item('rust-knife', 'Rust Knife', 'weapon', 'common', 'It has seen better decades. It still cuts.', { stat: 'might', value: 1 }),
      item('solar', 'Solar Cell', 'consumable', 'uncommon', 'A folded panel. It drinks the sun and gives it back on demand.', { heal: 6 }),
      item('map', 'Prewar Road Atlas', 'trinket', 'uncommon', 'Half the roads are gone. The other half still know where they used to go.', { stat: 'wits', value: 1 }),
    ],
  },
]

export const GENRES = [
  'Fantasy',
  'Sci-Fi',
  'Cyberpunk',
  'Mystery',
  'Horror',
  'Romance',
  'Mythic',
  'Historical',
  'Post-Apocalyptic',
  'Slice of Life',
] as const

export const GENRE_BLURBS: Record<string, string> = {
  Fantasy: 'Sword, sorcery, and kingdoms that keep their promises badly.',
  'Sci-Fi': 'New worlds, old questions, and machines that remember.',
  Cyberpunk: 'Neon, debt, and bodies that can be edited.',
  Mystery: 'Every answer opens a door with someone behind it.',
  Horror: 'The dark is not empty. It is being polite.',
  Romance: 'The most dangerous thing you can do is care.',
  Mythic: 'Gods, monsters, and stories that predate you.',
  Historical: 'The past is a foreign country with excellent parties.',
  'Post-Apocalyptic': 'After the end, people still make breakfast.',
  'Slice of Life': 'Small lives, large feelings, no world to save.',
}
