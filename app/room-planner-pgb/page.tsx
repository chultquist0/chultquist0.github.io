'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import emailjs from '@emailjs/browser'

// Room measured in inches. Scale to pixels.
const S = 3 // px per inch
const WALL_T_IN = 2 // wall thickness, drawn as two lines this far apart
const WALL_T = WALL_T_IN * S
const DOOR_INSET_IN = 2 // walls return this far into each doorway opening

const OX = 30
const OY = 30

const ROOM_W = 145 // bottom/top wall
const ROOM_H = 142.5 // left/right wall total height

const VW = OX + ROOM_W * S + 30
const VH = OY + ROOM_H * S + 30

// Convert room math coords (inches, y-down) → SVG screen coords
const rx = (x: number) => OX + x * S
const ry = (y: number) => OY + y * S

// L-shaped room: rectangle with a notch indented 14.75" into the left wall,
// spanning 57.75" (from y=42 to y=99.75).
const BASE_VERTS: [number, number][] = [
  [0, 0],
  [145, 0],
  [145, 142.5],
  [0, 142.5],
  [0, 99.75],
  [14.75, 99.75],
  [14.75, 42],
  [0, 42],
]

// Per-vertex direction to shift toward the room interior (mitered, since
// every wall here is axis-aligned so corners just combine the two adjacent
// edges' normals directly).
const INTERIOR_DIR: [number, number][] = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
  [1, 1],
  [1, 1],
  [1, -1],
  [1, -1],
]

// Wall face polygon, offset toward (sign=1) or away from (sign=-1) the interior.
function wallFacePath(sign: 1 | -1) {
  const halfT = (WALL_T_IN / 2) * sign
  const pts = BASE_VERTS.map(([x, y], i) => {
    const [dx, dy] = INTERIOR_DIR[i]
    return [x + dx * halfT, y + dy * halfT] as const
  })
  return (
    `M ${rx(pts[0][0])} ${ry(pts[0][1])} ` +
    pts
      .slice(1)
      .map(([x, y]) => `L ${rx(x)} ${ry(y)}`)
      .join(' ') +
    ' Z'
  )
}

const INNER_WALL_PATH = wallFacePath(1)
const OUTER_WALL_PATH = wallFacePath(-1)

const DEFS = {
  kivik: { label: 'Kivik', w: Math.round(38 * S), h: Math.round(90 * S) }, // 38"×90"
} as const

type FType = keyof typeof DEFS

const TEXT_ABOVE = new Set<FType>([])

interface Piece {
  id: number
  type: FType
  x: number
  y: number
  rot: number
}

function toSVG(el: SVGSVGElement | null, clientX: number, clientY: number) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return {
    x: ((clientX - r.left) / r.width) * VW,
    y: ((clientY - r.top) / r.height) * VH,
  }
}

let uid = 1

export default function RoomPlannerPgb() {
  const [pieces, setPieces] = useState<Piece[]>([])
  const [sel, setSel] = useState<number | null>(null)
  const [ghost, setGhost] = useState<{ x: number; y: number; type: FType } | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const rafRef = useRef<number | null>(null)

  const dragRef = useRef<{
    mode: 'palette' | 'item'
    type: FType
    pieceId?: number
    ox: number
    oy: number
  } | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const getXY = (e: MouseEvent | TouchEvent) => {
    const t = 'touches' in e ? (e.touches[0] ?? e.changedTouches[0]) : e
    return { clientX: t.clientX, clientY: t.clientY }
  }

  const onMove = useCallback((e: MouseEvent | TouchEvent) => {
    const d = dragRef.current
    if (!d) return
    if ('touches' in e) e.preventDefault()
    const { clientX, clientY } = getXY(e)
    // RAF-throttle the SVG state updates for smoothness
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const p = toSVG(svgRef.current, clientX, clientY)
      if (d.mode === 'palette') {
        setGhost(p ? { x: p.x, y: p.y, type: d.type } : null)
      } else if (d.mode === 'item' && p) {
        setPieces((prev) =>
          prev.map((pc) => (pc.id === d.pieceId ? { ...pc, x: p.x - d.ox, y: p.y - d.oy } : pc))
        )
      }
    })
  }, [])

  const onUp = useCallback((e: MouseEvent | TouchEvent) => {
    const d = dragRef.current
    if (!d) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (d.mode === 'palette') {
      const { clientX, clientY } = getXY(e)
      const svg = svgRef.current
      if (svg) {
        const r = svg.getBoundingClientRect()
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
          const p = toSVG(svg, clientX, clientY)!
          const id = uid++
          setPieces((prev) => [...prev, { id, type: d.type, x: p.x, y: p.y, rot: 0 }])
          setSel(id)
        }
      }
      setGhost(null)
    }
    dragRef.current = null
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [onMove, onUp])

  const selPiece = pieces.find((pc) => pc.id === sel) ?? null

  const setRot = (deg: number) =>
    sel !== null &&
    setPieces((prev) => prev.map((pc) => (pc.id === sel ? { ...pc, rot: deg } : pc)))

  const del = () => {
    if (sel === null) return
    setPieces((prev) => prev.filter((pc) => pc.id !== sel))
    setSel(null)
  }

  const [sending, setSending] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [showModal, setShowModal] = useState(false)
  const [senderName, setSenderName] = useState('')

  const doSend = async (name: string) => {
    const svg = svgRef.current
    if (!svg) return
    setSending('sending')
    try {
      const clone = svg.cloneNode(true) as SVGSVGElement
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      const svgStr = new XMLSerializer().serializeToString(clone)
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      // Small JPEG to stay under EmailJS payload limits
      const canvas = document.createElement('canvas')
      canvas.width = 500
      canvas.height = 500
      const ctx = canvas.getContext('2d')!
      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, 500, 500)
          ctx.drawImage(img, 0, 0, 500, 500)
          URL.revokeObjectURL(url)
          resolve()
        }
        img.onerror = reject
        img.src = url
      })
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { from_name: name, image: canvas.toDataURL('image/jpeg', 0.7) },
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! }
      )
      setSending('done')
      setTimeout(() => setSending('idle'), 3000)
    } catch (err) {
      console.error('EmailJS error:', err)
      setSending('error')
      setTimeout(() => setSending('idle'), 3000)
    }
  }

  const placedTypes = new Set(pieces.map((p) => p.type))
  const unplacedDefs = (Object.entries(DEFS) as [FType, (typeof DEFS)[FType]][]).filter(
    ([type]) => !placedTypes.has(type)
  )

  if (isMobile === null) return null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100dvh',
        overflow: 'hidden',
        minHeight: 0,
        fontFamily: 'monospace',
        userSelect: 'none',
        color: 'black',
        background: 'white',
      }}
    >
      {/* Sidebar — order:2 on mobile so SVG appears above it */}
      <div
        style={{
          order: isMobile ? 2 : undefined,
          width: isMobile ? '100%' : 160,
          borderRight: isMobile ? undefined : '1px solid black',
          borderTop: isMobile ? '1px solid black' : undefined,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Desktop header */}
        {!isMobile && (
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid black',
              fontWeight: 'bold',
              fontSize: 13,
            }}
          >
            Furniture
          </div>
        )}

        {/* Palette items */}
        <div
          style={{
            flex: isMobile ? undefined : 1,
            padding: isMobile ? '6px 10px' : 14,
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            gap: isMobile ? 10 : 14,
            overflowY: isMobile ? undefined : 'auto',
            overflowX: isMobile ? 'auto' : undefined,
            alignItems: isMobile ? 'center' : undefined,
            minHeight: 0,
            height: isMobile
              ? Math.max(...Object.values(DEFS).map((d) => d.h)) * 0.65 + 12
              : undefined,
          }}
        >
          {unplacedDefs.map(([type, def]) => {
            const scaledW = def.w * 0.65
            const scaledH = def.h * 0.65
            const small = scaledW < 50 || scaledH < 20
            const handlers = {
              onKeyDown: () => {},
              onMouseDown: (e: React.MouseEvent) => {
                e.preventDefault()
                dragRef.current = { mode: 'palette', type, ox: 0, oy: 0 }
                const p = toSVG(svgRef.current, e.clientX, e.clientY)
                setGhost(p ? { x: p.x, y: p.y, type } : null)
              },
              onTouchStart: (e: React.TouchEvent) => {
                e.preventDefault()
                const t = e.touches[0]
                dragRef.current = { mode: 'palette', type, ox: 0, oy: 0 }
                const p = toSVG(svgRef.current, t.clientX, t.clientY)
                setGhost(p ? { x: p.x, y: p.y, type } : null)
              },
            }
            if (small) {
              return (
                <div
                  key={type}
                  role="button"
                  tabIndex={0}
                  title={`Drag to place ${def.label}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'grab',
                    flexShrink: 0,
                  }}
                  {...handlers}
                >
                  <div
                    style={{
                      width: scaledW,
                      height: Math.max(scaledH, 12),
                      border: '1px solid black',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 8, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                    {def.label}
                  </span>
                </div>
              )
            }
            return (
              <div
                key={type}
                role="button"
                tabIndex={0}
                title={`Drag to place ${def.label}`}
                style={{
                  width: scaledW,
                  height: scaledH,
                  border: '1px solid black',
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 8,
                  textAlign: 'center',
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  padding: '2px',
                  flexShrink: 0,
                }}
                {...handlers}
              >
                {def.label}
              </div>
            )
          })}
        </div>

        {/* Controls row — always rendered so sidebar height stays constant on mobile */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            gap: 8,
            padding: isMobile ? '6px 10px' : 12,
            borderTop: '1px solid black',
            alignItems: isMobile ? 'center' : undefined,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 11,
              whiteSpace: 'nowrap',
              opacity: selPiece ? 1 : 0.3,
              flexShrink: 0,
              minWidth: isMobile ? 80 : undefined,
              display: 'inline-block',
            }}
          >
            Rotate: {selPiece?.rot ?? 0}°
          </span>
          <input
            type="range"
            min={0}
            max={355}
            step={5}
            value={selPiece?.rot ?? 0}
            disabled={!selPiece}
            onChange={(e) => setRot(Number(e.target.value))}
            style={{
              width: isMobile ? 110 : '100%',
              accentColor: 'black',
              opacity: selPiece ? 1 : 0.3,
              flexShrink: 0,
            }}
          />
          <Btn onClick={del} disabled={!selPiece}>
            Delete
          </Btn>
          <Btn onClick={() => setShowModal(true)} disabled={sending !== 'idle'}>
            {sending === 'sending'
              ? 'Sending…'
              : sending === 'done'
                ? 'Sent!'
                : sending === 'error'
                  ? 'Error'
                  : 'Send Design'}
          </Btn>
        </div>
      </div>

      {/* SVG canvas — order:1 on mobile so it appears above the sidebar */}
      <div
        style={{
          order: isMobile ? 1 : undefined,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 8,
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          style={{ width: '100%', height: '100%', maxWidth: VW, maxHeight: VH }}
          onMouseDown={(e) => {
            if ((e.target as Element) === svgRef.current) setSel(null)
          }}
        >
          {/* Room shape — walls drawn as two lines (inner + outer face), unfilled */}
          <path d={OUTER_WALL_PATH} fill="none" stroke="black" strokeWidth={1.5} />
          <path d={INNER_WALL_PATH} fill="none" stroke="black" strokeWidth={1.5} />

          {/* Left wall doorway: x=0, y=0..42 — walls return 2" into the opening on each side */}
          <line
            x1={rx(0)}
            y1={ry(DOOR_INSET_IN)}
            x2={rx(0)}
            y2={ry(42 - DOOR_INSET_IN)}
            stroke="white"
            strokeWidth={WALL_T + 8}
          />

          {/* Right wall doorway: x=145, y=104..142.5 — walls return 2" into the opening on each side */}
          <line
            x1={rx(145)}
            y1={ry(104 + DOOR_INSET_IN)}
            x2={rx(145)}
            y2={ry(142.5 - DOOR_INSET_IN)}
            stroke="white"
            strokeWidth={WALL_T + 8}
          />

          {/* Placed furniture */}
          {pieces.map((pc) => {
            const def = DEFS[pc.type]
            const isSel = pc.id === sel
            const lines = def.label.split('\n')
            return (
              <g
                key={pc.id}
                transform={`translate(${pc.x},${pc.y}) rotate(${pc.rot})`}
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSel(pc.id)
                  const p = toSVG(svgRef.current, e.clientX, e.clientY)!
                  dragRef.current = {
                    mode: 'item',
                    type: pc.type,
                    pieceId: pc.id,
                    ox: p.x - pc.x,
                    oy: p.y - pc.y,
                  }
                }}
                onTouchStart={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSel(pc.id)
                  const t = e.touches[0]
                  const p = toSVG(svgRef.current, t.clientX, t.clientY)!
                  dragRef.current = {
                    mode: 'item',
                    type: pc.type,
                    pieceId: pc.id,
                    ox: p.x - pc.x,
                    oy: p.y - pc.y,
                  }
                }}
              >
                <rect
                  x={-def.w / 2}
                  y={-def.h / 2}
                  width={def.w}
                  height={def.h}
                  fill="white"
                  stroke="black"
                  strokeWidth={isSel ? 2 : 1}
                  strokeDasharray={isSel ? '5,3' : undefined}
                />
                {lines.map((line, i) => (
                  <text
                    key={i}
                    textAnchor="middle"
                    y={
                      TEXT_ABOVE.has(pc.type)
                        ? -def.h / 2 - 4 - (lines.length - 1 - i) * 11
                        : (i - (lines.length - 1) / 2) * 11
                    }
                    dominantBaseline="middle"
                    fontSize="9"
                    fontFamily="monospace"
                    fill="black"
                    style={{ pointerEvents: 'none' }}
                  >
                    {line}
                  </text>
                ))}
              </g>
            )
          })}

          {/* Ghost while dragging from palette */}
          {ghost &&
            (() => {
              const def = DEFS[ghost.type]
              const lines = def.label.split('\n')
              return (
                <g
                  transform={`translate(${ghost.x},${ghost.y})`}
                  opacity={0.55}
                  style={{ pointerEvents: 'none' }}
                >
                  <rect
                    x={-def.w / 2}
                    y={-def.h / 2}
                    width={def.w}
                    height={def.h}
                    fill="white"
                    stroke="black"
                    strokeWidth="1"
                    strokeDasharray="5,3"
                  />
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      textAnchor="middle"
                      y={(i - (lines.length - 1) / 2) * 14}
                      dominantBaseline="middle"
                      fontSize="11"
                      fontFamily="monospace"
                      fill="black"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              )
            })()}
        </svg>
      </div>

      {/* Name modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowModal(false)}
        >
          <div
            style={{
              background: 'white',
              border: '1px solid black',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              fontFamily: 'monospace',
              minWidth: 260,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: 13 }}>Send Design</div>
            <div style={{ fontSize: 10, color: '#666' }}>
              Please don&apos;t spam - I only get 200 free emails/month
            </div>
            <input
              placeholder="Your name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && senderName.trim()) {
                  setShowModal(false)
                  doSend(senderName.trim())
                }
              }}
              style={{
                border: '1px solid black',
                padding: '4px 8px',
                fontFamily: 'monospace',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn
                onClick={() => {
                  if (!senderName.trim()) return
                  setShowModal(false)
                  doSend(senderName.trim())
                }}
              >
                Send
              </Btn>
              <Btn onClick={() => setShowModal(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Btn({
  onClick,
  children,
  disabled,
}: {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: '1px solid black',
        padding: '4px 8px',
        background: !disabled && hov ? 'black' : 'white',
        color: !disabled && hov ? 'white' : 'black',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: 12,
        fontFamily: 'monospace',
      }}
    >
      {children}
    </button>
  )
}
