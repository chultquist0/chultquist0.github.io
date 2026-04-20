'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import emailjs from '@emailjs/browser'

const S = 30 // px per foot
const ROOM = 15 * S // 450
const BAY = 6 * S // 240
const OX = BAY + S // 270
const OY = BAY + S // 270
const VW = OX + ROOM + S // 750
const VH = OY + ROOM + S // 750

// Room outline: rectangle with circular bay window extending from top-left corner
const ROOM_PATH = `M ${OX + BAY} ${OY} A ${BAY} ${BAY} 0 1 0 ${OX} ${OY + BAY} L ${OX} ${OY + ROOM} L ${OX + ROOM} ${OY + ROOM} L ${OX + ROOM} ${OY} Z`

const DEFS = {
  bed: { label: 'Bed\n(Full)', w: Math.round(4.5 * S), h: Math.round(6.25 * S) }, // 135 x 188
  desk: { label: 'Desk', w: Math.round(2.25 * S), h: Math.round(3.125 * S) }, // 68 x 94
} as const

type FType = keyof typeof DEFS

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

export default function RoomPlanner() {
  const [pieces, setPieces] = useState<Piece[]>([])
  const [sel, setSel] = useState<number | null>(null)
  const [ghost, setGhost] = useState<{ x: number; y: number; type: FType } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const dragRef = useRef<{
    mode: 'palette' | 'item'
    type: FType
    pieceId?: number
    ox: number
    oy: number
  } | null>(null)

  const onMove = useCallback((e: MouseEvent) => {
    const d = dragRef.current
    if (!d) return
    const p = toSVG(svgRef.current, e.clientX, e.clientY)
    if (d.mode === 'palette') {
      setGhost(p ? { x: p.x, y: p.y, type: d.type } : null)
    } else if (d.mode === 'item' && p) {
      setPieces((prev) =>
        prev.map((pc) => (pc.id === d.pieceId ? { ...pc, x: p.x - d.ox, y: p.y - d.oy } : pc))
      )
    }
  }, [])

  const onUp = useCallback((e: MouseEvent) => {
    const d = dragRef.current
    if (!d) return
    if (d.mode === 'palette') {
      const svg = svgRef.current
      if (svg) {
        const r = svg.getBoundingClientRect()
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          const p = toSVG(svg, e.clientX, e.clientY)!
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
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [onMove, onUp])

  const selPiece = pieces.find((pc) => pc.id === sel) ?? null

  const setRot = (deg: number) =>
    sel !== null && setPieces((prev) => prev.map((pc) => (pc.id === sel ? { ...pc, rot: deg } : pc)))

  const del = () => {
    if (sel === null) return
    setPieces((prev) => prev.filter((pc) => pc.id !== sel))
    setSel(null)
  }

  const [sending, setSending] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const sendDesign = async () => {
    const svg = svgRef.current
    if (!svg) return
    setSending('sending')
    try {
      const clone = svg.cloneNode(true) as SVGSVGElement
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      const svgStr = new XMLSerializer().serializeToString(clone)
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const canvas = document.createElement('canvas')
      canvas.width = VW
      canvas.height = VH
      const ctx = canvas.getContext('2d')!
      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, VW, VH)
          ctx.drawImage(img, 0, 0, VW, VH)
          URL.revokeObjectURL(url)
          resolve()
        }
        img.onerror = reject
        img.src = url
      })
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { image: canvas.toDataURL('image/png') },
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! }
      )
      setSending('done')
      setTimeout(() => setSending('idle'), 3000)
    } catch {
      setSending('error')
      setTimeout(() => setSending('idle'), 3000)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 10rem)',
        minHeight: 480,
        fontFamily: 'monospace',
        userSelect: 'none',
        color: 'black',
        background: 'white',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 160,
          borderRight: '1px solid black',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '10px 14px', borderBottom: '1px solid black', fontWeight: 'bold', fontSize: 13 }}>
          Furniture
        </div>
        <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {(Object.entries(DEFS) as [FType, (typeof DEFS)[FType]][]).map(([type, def]) => (
            <div
              key={type}
              title={`Drag to place ${def.label}`}
              style={{
                width: def.w * 0.65,
                height: def.h * 0.65,
                border: '1px solid black',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                textAlign: 'center',
                lineHeight: 1.4,
                whiteSpace: 'pre-line',
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                dragRef.current = { mode: 'palette', type, ox: 0, oy: 0 }
                const p = toSVG(svgRef.current, e.clientX, e.clientY)
                setGhost(p ? { x: p.x, y: p.y, type } : null)
              }}
            >
              {def.label}
            </div>
          ))}
        </div>

        {sel !== null && selPiece && (
          <div style={{ padding: 12, borderTop: '1px solid black', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11 }}>Rotate: {selPiece.rot}°</div>
            <input
              type="range"
              min={0}
              max={355}
              step={5}
              value={selPiece.rot}
              onChange={(e) => setRot(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'black' }}
            />
            <Btn onClick={del}>Delete</Btn>
          </div>
        )}

        <div style={{ padding: 12, borderTop: '1px solid black' }}>
          <Btn onClick={sendDesign} disabled={sending !== 'idle'}>
            {sending === 'sending' ? 'Sending…' : sending === 'done' ? 'Sent!' : sending === 'error' ? 'Error' : 'Send Design'}
          </Btn>
        </div>
        <div style={{ padding: '8px 14px', borderTop: '1px solid black', fontSize: 10, color: '#666', lineHeight: 1.5 }}>
          Drag to place.
          <br />
          Click to select.
        </div>
      </div>

      {/* SVG canvas */}
      <div
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 8 }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          style={{ width: '100%', height: '100%', maxWidth: VW, maxHeight: VH }}
          onMouseDown={(e) => {
            if ((e.target as Element) === svgRef.current) setSel(null)
          }}
        >
          {/* Room shape */}
          <path d={ROOM_PATH} fill="white" stroke="black" strokeWidth="2" />

          {/* Dimension labels */}
          <text
            x={OX + ROOM / 2}
            y={OY + ROOM + 20}
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fill="black"
          >
            15 ft
          </text>
          <text
            x={OX + ROOM + 20}
            y={OY + ROOM / 2}
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fill="black"
            transform={`rotate(90, ${OX + ROOM + 20}, ${OY + ROOM / 2})`}
          >
            15 ft
          </text>
          {/* Door on right wall — 3 ft wide, 0.5 ft from bottom wall, hinge at bottom, arc sweeps up */}
          {(() => {
            const DW = 3 * S
            const hx = OX + ROOM             // right wall x
            const yBot = OY + ROOM - S / 2   // hinge (bottom of opening, 0.5 ft above bottom wall)
            const yTop = yBot - DW           // top of opening
            return (
              <g>
                {/* erase right wall stroke over the opening */}
                <rect x={hx - 2} y={yTop} width={4} height={DW} fill="white" />
                {/* door panel: from hinge (bottom) going left into room */}
                <line x1={hx} y1={yBot} x2={hx - DW} y2={yBot} stroke="black" strokeWidth="1.5" />
                {/* swing arc: curves counterclockwise upward */}
                <path
                  d={`M ${hx - DW} ${yBot} A ${DW} ${DW} 0 0 0 ${hx} ${yTop}`}
                  fill="none"
                  stroke="black"
                  strokeWidth="1"
                  strokeDasharray="4,3"
                />
              </g>
            )
          })()}

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
                  dragRef.current = { mode: 'item', type: pc.type, pieceId: pc.id, ox: p.x - pc.x, oy: p.y - pc.y }
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
                    y={(i - (lines.length - 1) / 2) * 14}
                    dominantBaseline="middle"
                    fontSize="11"
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
