'use client'

import React, { ReactNode, useRef, useState, useEffect, useMemo } from 'react'
import Draggable from 'react-draggable'
import type { DraggableEvent, DraggableData } from 'react-draggable'
import { X, Minus, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'

const TASKBAR_HEIGHT = 48

type Bounds = { width: number; height: number; x: number; y: number }

interface Props {
  id: string
  title: string
  children: ReactNode
  onMinimize?: () => void
  onClose?: () => void
  minimized?: boolean
  defaultWidth?: number
  defaultHeight?: number
}

export function WorktopWindow({
  id,
  title,
  children,
  onMinimize,
  onClose,
  minimized = false,
  defaultWidth = 1100,
  defaultHeight = 680,
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMaximized, setIsMaximized] = useState(false)

  const MIN_W = 520
  const MIN_H = 300

  const [bounds, setBounds] = useState<Bounds>(() => {
    if (typeof window === 'undefined') {
      return { width: defaultWidth, height: defaultHeight, x: 60, y: 40 }
    }
    const saved = localStorage.getItem(`tw-window-${id}-bounds`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {}
    }
    const w = Math.min(defaultWidth, window.innerWidth - 40)
    const h = Math.min(defaultHeight, window.innerHeight - TASKBAR_HEIGHT - 40)
    return {
      width: w,
      height: h,
      x: Math.round(window.innerWidth / 2 - w / 2),
      y: Math.round((window.innerHeight - TASKBAR_HEIGHT) / 2 - h / 2),
    }
  })

  const [resizing, setResizing] = useState<{
    dir: 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
    startX: number; startY: number
    startW: number; startH: number
    startPX: number; startPY: number
  } | null>(null)

  // Persist bounds
  useEffect(() => {
    localStorage.setItem(`tw-window-${id}-bounds`, JSON.stringify(bounds))
  }, [bounds, id])

  // Drag
  const handleDrag = (_: DraggableEvent, data: DraggableData) =>
    setBounds((prev) => ({ ...prev, x: data.x, y: data.y }))

  const dragBounds = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const actualW = nodeRef.current?.offsetWidth ?? bounds.width
    const actualH = nodeRef.current?.offsetHeight ?? bounds.height
    return {
      left: 0,
      top: 0,
      right: Math.max(0, window.innerWidth - actualW),
      bottom: Math.max(0, window.innerHeight - TASKBAR_HEIGHT - actualH),
    }
  }, [bounds.width, bounds.height])

  // Maximize toggle
  const handleToggleMaximize = () => {
    const restoreKey = `tw-window-${id}-restore`
    if (isMaximized) {
      const saved = localStorage.getItem(restoreKey)
      if (saved) setBounds(JSON.parse(saved))
      setIsMaximized(false)
      localStorage.removeItem(restoreKey)
    } else {
      localStorage.setItem(restoreKey, JSON.stringify(bounds))
      setBounds({
        width: window.innerWidth,
        height: window.innerHeight - TASKBAR_HEIGHT,
        x: 0,
        y: 0,
      })
      setIsMaximized(true)
    }
  }

  // Resize on window resize
  useEffect(() => {
    const onResize = () => {
      if (isMaximized) {
        setBounds({
          width: window.innerWidth,
          height: window.innerHeight - TASKBAR_HEIGHT,
          x: 0,
          y: 0,
        })
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isMaximized])

  // Resizing logic
  useEffect(() => {
    if (!resizing) return
    const onMove = (e: MouseEvent) => {
      setBounds((prev: Bounds) => {
        if (!resizing) return prev
        const dx = e.clientX - resizing.startX
        const dy = e.clientY - resizing.startY
        let { startW: nW, startH: nH, startPX: nX, startPY: nY } = resizing
        const vw = window.innerWidth
        const vh = window.innerHeight - TASKBAR_HEIGHT
        const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

        switch (resizing.dir) {
          case 'e': nW = clamp(resizing.startW + dx, MIN_W, vw - nX); break
          case 's': nH = clamp(resizing.startH + dy, MIN_H, vh - nY); break
          case 'se':
            nW = clamp(resizing.startW + dx, MIN_W, vw - nX)
            nH = clamp(resizing.startH + dy, MIN_H, vh - nY)
            break
          case 'w': {
            const tw = clamp(resizing.startW - dx, MIN_W, resizing.startW + resizing.startPX)
            nX = clamp(resizing.startPX - (tw - resizing.startW), 0, vw - tw)
            nW = tw; break
          }
          case 'n': {
            const th = clamp(resizing.startH - dy, MIN_H, resizing.startH + resizing.startPY)
            nY = clamp(resizing.startPY - (th - resizing.startH), 0, vh - th)
            nH = th; break
          }
          case 'ne': {
            const th = clamp(resizing.startH - dy, MIN_H, resizing.startH + resizing.startPY)
            nY = clamp(resizing.startPY - (th - resizing.startH), 0, vh - th)
            nH = th
            nW = clamp(resizing.startW + dx, MIN_W, vw - nX)
            break
          }
          case 'sw': {
            const tw = clamp(resizing.startW - dx, MIN_W, resizing.startW + resizing.startPX)
            nX = clamp(resizing.startPX - (tw - resizing.startW), 0, vw - tw)
            nW = tw
            nH = clamp(resizing.startH + dy, MIN_H, vh - nY)
            break
          }
          case 'nw': {
            const tw = clamp(resizing.startW - dx, MIN_W, resizing.startW + resizing.startPX)
            nX = clamp(resizing.startPX - (tw - resizing.startW), 0, vw - tw)
            nW = tw
            const th = clamp(resizing.startH - dy, MIN_H, resizing.startH + resizing.startPY)
            nY = clamp(resizing.startPY - (th - resizing.startH), 0, vh - th)
            nH = th
            break
          }
        }
        return { ...prev, width: nW, height: nH, x: nX, y: nY }
      })
    }
    const onUp = () => setResizing(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [resizing])

  const startResize =
    (dir: typeof resizing extends null ? never : NonNullable<typeof resizing>['dir']) =>
    (e: React.MouseEvent) => {
      if (isMaximized) return
      e.preventDefault()
      setResizing({
        dir, startX: e.clientX, startY: e.clientY,
        startW: bounds.width, startH: bounds.height,
        startPX: bounds.x, startPY: bounds.y,
      })
    }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setRefreshKey((k) => k + 1)
    setTimeout(() => setIsRefreshing(false), 600)
  }

  if (minimized) return null

  const resizeEdge = 'absolute bg-transparent z-10'

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-header"
      disabled={isMaximized}
      bounds={dragBounds}
      position={{ x: bounds.x, y: bounds.y }}
      onDrag={handleDrag}
    >
      <div
        ref={nodeRef}
        className="absolute flex flex-col pointer-events-auto rounded-xl shadow-2xl text-[13px]"
        style={{
          width: bounds.width,
          height: bounds.height,
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          zIndex: 100,
        }}
      >
        {/* Resize handles */}
        {!isMaximized && (
          <>
            <div className={`${resizeEdge} top-0 left-2 right-2 h-1.5 cursor-ns-resize`} onMouseDown={startResize('n')} />
            <div className={`${resizeEdge} bottom-0 left-2 right-2 h-1.5 cursor-ns-resize`} onMouseDown={startResize('s')} />
            <div className={`${resizeEdge} left-0 top-2 bottom-2 w-1.5 cursor-ew-resize`} onMouseDown={startResize('w')} />
            <div className={`${resizeEdge} right-0 top-2 bottom-2 w-1.5 cursor-ew-resize`} onMouseDown={startResize('e')} />
            <div className={`${resizeEdge} top-0 left-0 w-3 h-3 cursor-nwse-resize`} onMouseDown={startResize('nw')} />
            <div className={`${resizeEdge} top-0 right-0 w-3 h-3 cursor-nesw-resize`} onMouseDown={startResize('ne')} />
            <div className={`${resizeEdge} bottom-0 left-0 w-3 h-3 cursor-nesw-resize`} onMouseDown={startResize('sw')} />
            <div className={`${resizeEdge} bottom-0 right-0 w-3 h-3 cursor-nwse-resize`} onMouseDown={startResize('se')} />
          </>
        )}

        {/* Title Bar */}
        <div
          className="window-header flex items-center justify-between rounded-t-xl border-b border-black/10 px-3 py-2 shadow-md cursor-move select-none shrink-0"
          style={{ backgroundColor: '#081124', color: '#FCA311' }}
          onDoubleClick={handleToggleMaximize}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ backgroundColor: 'rgba(252,163,17,0.15)' }}>
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wide">{title}</h3>
          </div>
          <div className="flex items-center space-x-2" style={{ color: '#FCA311' }}>
            <button onClick={handleRefresh} className="transition-colors hover:opacity-70" aria-label="Refresh">
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            {onMinimize && (
              <button onClick={onMinimize} className="transition-colors hover:opacity-70" aria-label="Minimize">
                <Minus size={14} />
              </button>
            )}
            <button onClick={handleToggleMaximize} className="transition-colors hover:opacity-70" aria-label={isMaximized ? 'Restore' : 'Maximize'}>
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            {onClose && (
              <button onClick={onClose} className="transition-colors hover:opacity-70" aria-label="Close">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div key={refreshKey} className="flex-1 overflow-auto window-scroll min-h-0 rounded-b-xl">
          {children}
        </div>
      </div>
    </Draggable>
  )
}
