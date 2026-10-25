import type { ArtSpec, Motif, Palette } from '../types'

function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Stars({ rng, n }: { rng: () => number; n: number }) {
  const stars = Array.from({ length: n }, () => ({
    x: rng() * 100,
    y: rng() * 60,
    r: 0.2 + rng() * 0.7,
    o: 0.3 + rng() * 0.7,
  }))
  return (
    <g>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
      ))}
    </g>
  )
}

function Scene({ motif, palette, seed }: { motif: Motif; palette: Palette; seed: number }) {
  const rng = mulberry(seed * 9973 + 17)
  switch (motif) {
    case 'mountains': {
      const peaks1 = Array.from({ length: 6 }, (_, i) => `${i * 18}, ${58 - rng() * 14}`)
      const p1 = peaks1.map((p) => p.split(', ')).map(([x, y]) => `${x},${y}`)
      return (
        <g>
          <Stars rng={rng} n={80} />
          <circle cx={74} cy={26} r={11} fill={palette.glow} opacity="0.9" />
          <circle cx={74} cy={26} r={17} fill={palette.glow} opacity="0.18" />
          <polygon points={`-5,72 ${p1.join(' ')} 105,70`} fill={palette.deep} opacity="0.85" />
          <polygon points="-5,80 12,54 26,62 40,44 55,58 68,50 82,60 105,52 105,82" fill={palette.sky} />
          <polygon points="-5,84 20,66 38,72 58,60 76,70 95,62 105,70 105,86" fill="#000" opacity="0.45" />
        </g>
      )
    }
    case 'forest': {
      const trees = Array.from({ length: 14 }, (_, i) => {
        const x = 4 + i * 7 + rng() * 3
        const h = 16 + rng() * 18
        return { x, h }
      })
      return (
        <g>
          <Stars rng={rng} n={34} />
          <circle cx={22} cy={22} r={9} fill={palette.glow} opacity="0.5" />
          {trees.map((t, i) => (
            <polygon
              key={i}
              points={`${t.x},${72 - t.h} ${t.x - 4},${72} ${t.x + 4},${72}`}
              fill={i % 2 ? palette.deep : '#00000066'}
            />
          ))}
          <rect x="0" y="70" width="100" height="26" fill="#00000055" />
          <rect x="0" y="66" width="100" height="16" fill={palette.accent} opacity="0.12" />
        </g>
      )
    }
    case 'ocean': {
      return (
        <g>
          <Stars rng={rng} n={60} />
          <circle cx={70} cy={20} r={9} fill="#fff" opacity="0.85" />
          <path d="M0,58 Q25,52 50,58 T100,58 L100,88 L0,88 Z" fill={palette.accent} opacity="0.35" />
          <path d="M0,64 Q25,58 50,64 T100,64 L100,88 L0,88 Z" fill={palette.accent} opacity="0.4" />
          <path d="M0,72 Q25,66 50,72 T100,72 L100,88 L0,88 Z" fill={palette.deep} opacity="0.9" />
          <ellipse cx="20" cy="60" rx="6" ry="1.2" fill="#fff" opacity="0.25" />
          <ellipse cx="66" cy="62" rx="9" ry="1.2" fill="#fff" opacity="0.18" />
        </g>
      )
    }
    case 'desert': {
      return (
        <g>
          <circle cx={72} cy={22} r={10} fill={palette.glow} />
          <circle cx={72} cy={22} r={15} fill={palette.glow} opacity="0.2" />
          <path d="M0,62 Q30,50 55,62 T100,58 L100,88 L0,88 Z" fill={palette.sky} />
          <path d="M0,70 Q25,60 52,70 T100,66 L100,88 L0,88 Z" fill={palette.deep} opacity="0.75" />
          <path d="M0,78 Q35,70 60,78 T100,76 L100,88 L0,88 Z" fill="#00000055" />
        </g>
      )
    }
    case 'space': {
      return (
        <g>
          <Stars rng={rng} n={110} />
          <circle cx={30} cy={34} r={16} fill={palette.accent} opacity="0.25" />
          <circle cx={30} cy={34} r={12} fill={palette.accent} opacity="0.55" />
          <ellipse cx="30" cy="34" rx="21" ry="5" fill="none" stroke={palette.glow} strokeWidth="1.2" opacity="0.7" />
          <circle cx={80} cy={18} r={3} fill={palette.glow} />
          <path d="M0,78 Q30,70 60,78 T100,74 L100,88 L0,88 Z" fill={palette.deep} />
        </g>
      )
    }
    case 'city': {
      const towers = Array.from({ length: 11 }, (_, i) => {
        const w = 5 + rng() * 4
        const h = 18 + rng() * 30
        return { x: i * 9.4 + rng() * 2, w, h }
      })
      return (
        <g>
          <Stars rng={rng} n={26} />
          {towers.map((t, i) => (
            <g key={i}>
              <rect x={t.x} y={74 - t.h} width={t.w} height={t.h + 14} fill={i % 3 === 0 ? '#00000077' : palette.deep} opacity="0.95" />
              {Array.from({ length: Math.floor(t.h / 5) }, (_, j) => (
                <rect key={j} x={t.x + 1} y={76 - t.h + j * 5} width={t.w - 2} height="1.6" fill={rng() > 0.5 ? palette.accent : palette.glow} opacity={0.4 + rng() * 0.5} />
              ))}
            </g>
          ))}
          <rect x="0" y="0" width="100" height="88" fill={palette.glow} opacity="0.06" />
          <rect x="0" y="84" width="100" height="4" fill={palette.accent} opacity="0.3" />
        </g>
      )
    }
    case 'ruins': {
      return (
        <g>
          <Stars rng={rng} n={44} />
          <circle cx={70} cy={22} r={8} fill={palette.glow} opacity="0.7" />
          <path d="M0,70 Q30,60 60,70 T100,64 L100,88 L0,88 Z" fill={palette.deep} opacity="0.9" />
          {[8, 20, 64, 78].map((x, i) => (
            <g key={i} opacity="0.9">
              <rect x={x} y={40 - (i % 2) * 10} width="4" height={30 + (i % 2) * 10} fill="#00000088" />
              <rect x={x - 1} y={38 - (i % 2) * 10} width="6" height="3" fill="#000000aa" />
            </g>
          ))}
          <circle cx="50" cy="30" r="2.4" fill={palette.accent} />
          <circle cx="62" cy="18" r="1.6" fill={palette.accent} />
        </g>
      )
    }
    case 'dream': {
      return (
        <g>
          <Stars rng={rng} n={90} />
          <circle cx={72} cy={24} r={12} fill={palette.glow} opacity="0.35" />
          <circle cx={72} cy={24} r={7} fill={palette.glow} opacity="0.8" />
          <ellipse cx="30" cy="46" rx="16" ry="4" fill={palette.accent} opacity="0.5" />
          <ellipse cx="30" cy="43" rx="10" ry="3" fill={palette.deep} />
          <ellipse cx="64" cy="60" rx="13" ry="3.5" fill={palette.accent} opacity="0.4" />
          <ellipse cx="64" cy="57" rx="8" ry="2.5" fill={palette.deep} />
          <path d="M10,20 Q30,4 50,20 Q70,36 90,20" fill="none" stroke={palette.accent} strokeWidth="0.8" opacity="0.5" />
        </g>
      )
    }
  }
}

export function CoverArt({
  art,
  className,
  showVignette = true,
}: {
  art: ArtSpec
  className?: string
  showVignette?: boolean
}) {
  const uid = `art${art.seed}${Math.abs(
    [...`${art.motif}${art.palette.deep}`].reduce((a, c) => ((a * 31 + c.charCodeAt(0)) | 0), 7),
  )}`
  return (
    <svg
      viewBox="0 0 100 88"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={art.palette.sky} />
          <stop offset="100%" stopColor={art.palette.deep} />
        </linearGradient>
        <radialGradient id={`vig-${uid}`} cx="50%" cy="42%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <filter id={`grain-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.06" />
          </feComponentTransfer>
          <feComposite operator="over" in2="SourceGraphic" />
        </filter>
        <filter id={`soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect width="100" height="88" fill={`url(#bg-${uid})`} />
      <rect width="100" height="88" fill={art.palette.accent} opacity="0.05" filter={`url(#soft-${uid})`} />
      <Scene motif={art.motif} palette={art.palette} seed={art.seed} />
      {showVignette && <rect width="100" height="88" fill={`url(#vig-${uid})`} />}
    </svg>
  )
}

export function Avatar({
  art,
  name,
  size = 36,
  className,
}: {
  art: ArtSpec
  name: string
  size?: number
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span
      className={`avatar ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${art.palette.sky}, ${art.palette.deep})`,
      }}
    >
      <CoverArt art={art} showVignette={false} />
      <span className="avatar-initials" style={{ fontSize: size * 0.36 }}>
        {initials}
      </span>
    </span>
  )
}
