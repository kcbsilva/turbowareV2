'use client'

import { useEffect, useRef } from 'react'

type Node = {
  x: number
  y: number
  ox: number
  oy: number
  vx: number
  vy: number
  r: number
}

const NODE_COUNT = 48
const LINK_DIST = 140
const CURSOR_RADIUS = 180

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Interactive fiber-web + soft static that reacts to the cursor. */
export function LoginNetworkBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduced = prefersReducedMotion()
    let nodes: Node[] = []
    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1
    const mouse = { x: -9999, y: -9999, active: false }
    let staticPhase = 0

    function seed() {
      nodes = Array.from({ length: NODE_COUNT }, () => {
        const x = Math.random() * w
        const y = Math.random() * h
        return {
          x,
          y,
          ox: x,
          oy: y,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: 1.2 + Math.random() * 1.8,
        }
      })
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas!.width = Math.floor(w * dpr)
      canvas!.height = Math.floor(h * dpr)
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    function drawStatic() {
      const density = mouse.active ? 90 : 35
      for (let i = 0; i < density; i++) {
        const near = mouse.active && Math.random() > 0.35
        const x = near ? mouse.x + (Math.random() - 0.5) * CURSOR_RADIUS * 1.4 : Math.random() * w
        const y = near ? mouse.y + (Math.random() - 0.5) * CURSOR_RADIUS * 1.4 : Math.random() * h
        const a = near ? 0.08 + Math.random() * 0.12 : 0.03 + Math.random() * 0.04
        ctx!.fillStyle = `rgba(255,255,255,${a})`
        ctx!.fillRect(x, y, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5)
      }
    }

    function frame() {
      ctx!.clearRect(0, 0, w, h)
      staticPhase += 1

      if (!reduced) {
        for (const n of nodes) {
          n.x += n.vx
          n.y += n.vy
          n.vx += (n.ox - n.x) * 0.0008
          n.vy += (n.oy - n.y) * 0.0008
          n.vx *= 0.99
          n.vy *= 0.99

          if (n.x < -20) n.x = w + 20
          if (n.x > w + 20) n.x = -20
          if (n.y < -20) n.y = h + 20
          if (n.y > h + 20) n.y = -20

          if (mouse.active) {
            const dx = n.x - mouse.x
            const dy = n.y - mouse.y
            const dist = Math.hypot(dx, dy) || 1
            if (dist < CURSOR_RADIUS) {
              const force = (1 - dist / CURSOR_RADIUS) * 0.35
              n.vx += (dx / dist) * force * 0.15
              n.vy += (dy / dist) * force * 0.15
            }
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist > LINK_DIST) continue

          let alpha = (1 - dist / LINK_DIST) * 0.22
          if (mouse.active) {
            const midX = (a.x + b.x) / 2
            const midY = (a.y + b.y) / 2
            const md = Math.hypot(midX - mouse.x, midY - mouse.y)
            if (md < CURSOR_RADIUS) {
              alpha += (1 - md / CURSOR_RADIUS) * 0.35
            }
          }

          const warm = mouse.active && alpha > 0.28
          ctx!.strokeStyle = warm
            ? `rgba(255,255,255,${Math.min(alpha, 0.45)})`
            : `rgba(255,255,255,${Math.min(alpha, 0.12)})`
          ctx!.lineWidth = warm ? 1.25 : 1
          ctx!.beginPath()
          ctx!.moveTo(a.x, a.y)
          ctx!.lineTo(b.x, b.y)
          ctx!.stroke()
        }
      }

      if (mouse.active) {
        for (const n of nodes) {
          const dist = Math.hypot(n.x - mouse.x, n.y - mouse.y)
          if (dist > CURSOR_RADIUS) continue
          const a = (1 - dist / CURSOR_RADIUS) * 0.45
          ctx!.strokeStyle = `rgba(255,255,255,${a})`
          ctx!.lineWidth = 1
          ctx!.beginPath()
          ctx!.moveTo(mouse.x, mouse.y)
          ctx!.lineTo(n.x, n.y)
          ctx!.stroke()
        }

        const pulse = 3 + Math.sin(staticPhase * 0.08) * 0.8
        ctx!.fillStyle = 'rgba(255,255,255,0.9)'
        ctx!.beginPath()
        ctx!.arc(mouse.x, mouse.y, pulse, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx!.lineWidth = 1
        ctx!.beginPath()
        ctx!.arc(mouse.x, mouse.y, 18 + Math.sin(staticPhase * 0.06) * 2, 0, Math.PI * 2)
        ctx!.stroke()
      }

      for (const n of nodes) {
        let glow = 0
        if (mouse.active) {
          const dist = Math.hypot(n.x - mouse.x, n.y - mouse.y)
          if (dist < CURSOR_RADIUS) glow = 1 - dist / CURSOR_RADIUS
        }
        ctx!.fillStyle = glow > 0.15
          ? `rgba(255,255,255,${0.45 + glow * 0.5})`
          : 'rgba(255,255,255,0.22)'
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, n.r + glow * 1.5, 0, Math.PI * 2)
        ctx!.fill()
      }

      if (!reduced) drawStatic()

      raf = requestAnimationFrame(frame)
    }

    function onMove(e: PointerEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }

    function onLeave() {
      mouse.active = false
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  )
}
