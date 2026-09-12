'use client'

import { useEffect, useRef } from 'react'

const NODE_COUNT = 48
const LINK_DIST = 140
const CURSOR_RADIUS = 180

type Node = {
  x: number
  y: number
  ox: number
  oy: number
  vx: number
  vy: number
  r: number
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Interactive fiber-web canvas from turboisp-react `LoginNetworkBackdrop`. */
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
    let width = 0
    let height = 0
    let dpr = 1
    const pointer = { x: -9999, y: -9999, active: false }
    let tick = 0

    function seed() {
      nodes = Array.from({ length: NODE_COUNT }, () => {
        const x = Math.random() * width
        const y = Math.random() * height
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
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    function drawStatic() {
      const count = pointer.active ? 90 : 35
      for (let i = 0; i < count; i++) {
        const nearCursor = pointer.active && Math.random() > 0.35
        const x = nearCursor
          ? pointer.x + (Math.random() - 0.5) * CURSOR_RADIUS * 1.4
          : Math.random() * width
        const y = nearCursor
          ? pointer.y + (Math.random() - 0.5) * CURSOR_RADIUS * 1.4
          : Math.random() * height
        const alpha = nearCursor ? 0.08 + Math.random() * 0.12 : 0.03 + Math.random() * 0.04
        ctx.fillStyle = Math.random() > 0.7 ? `rgba(252,163,17,${alpha})` : `rgba(8,17,36,${alpha})`
        ctx.fillRect(x, y, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5)
      }
    }

    function frame() {
      ctx.clearRect(0, 0, width, height)
      tick += 1

      if (!reduced) {
        for (const node of nodes) {
          node.x += node.vx
          node.y += node.vy
          node.vx += (node.ox - node.x) * 8e-4
          node.vy += (node.oy - node.y) * 8e-4
          node.vx *= 0.99
          node.vy *= 0.99
          if (node.x < -20) node.x = width + 20
          if (node.x > width + 20) node.x = -20
          if (node.y < -20) node.y = height + 20
          if (node.y > height + 20) node.y = -20
          if (pointer.active) {
            const dx = node.x - pointer.x
            const dy = node.y - pointer.y
            const dist = Math.hypot(dx, dy) || 1
            if (dist < CURSOR_RADIUS) {
              const force = (1 - dist / CURSOR_RADIUS) * 0.35
              node.vx += (dx / dist) * force * 0.15
              node.vy += (dy / dist) * force * 0.15
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
          if (pointer.active) {
            const midX = (a.x + b.x) / 2
            const midY = (a.y + b.y) / 2
            const midDist = Math.hypot(midX - pointer.x, midY - pointer.y)
            if (midDist < CURSOR_RADIUS) alpha += (1 - midDist / CURSOR_RADIUS) * 0.35
          }
          const hot = pointer.active && alpha > 0.28
          ctx.strokeStyle = hot
            ? `rgba(252,163,17,${Math.min(alpha, 0.55)})`
            : `rgba(35,59,110,${Math.min(alpha, 0.4)})`
          ctx.lineWidth = hot ? 1.25 : 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      if (pointer.active) {
        for (const node of nodes) {
          const dist = Math.hypot(node.x - pointer.x, node.y - pointer.y)
          if (dist > CURSOR_RADIUS) continue
          const alpha = (1 - dist / CURSOR_RADIUS) * 0.45
          ctx.strokeStyle = `rgba(252,163,17,${alpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pointer.x, pointer.y)
          ctx.lineTo(node.x, node.y)
          ctx.stroke()
        }
        const radius = 3 + Math.sin(tick * 0.08) * 0.8
        ctx.fillStyle = 'rgba(252,163,17,0.85)'
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(252,163,17,0.25)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 18 + Math.sin(tick * 0.06) * 2, 0, Math.PI * 2)
        ctx.stroke()
      }

      for (const node of nodes) {
        let heat = 0
        if (pointer.active) {
          const dist = Math.hypot(node.x - pointer.x, node.y - pointer.y)
          if (dist < CURSOR_RADIUS) heat = 1 - dist / CURSOR_RADIUS
        }
        ctx.fillStyle = heat > 0.15
          ? `rgba(252,163,17,${0.45 + heat * 0.5})`
          : 'rgba(35,59,110,0.55)'
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r + heat * 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!reduced) drawStatic()
      raf = requestAnimationFrame(frame)
    }

    function onMove(event: PointerEvent) {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
    }

    function onLeave() {
      pointer.active = false
      pointer.x = -9999
      pointer.y = -9999
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
