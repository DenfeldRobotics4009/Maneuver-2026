import * as React from "react"

export function SwipeToOpenDetector({ onOpen }: { onOpen: () => void }) {
  React.useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches?.[0]
      const edgeThreshold = 30
      
      if (touch && touch.clientX <= edgeThreshold) {
        const startX = touch.clientX
        const startTime = Date.now()
        
        const handleTouchMove = (moveEvent: TouchEvent) => {
          const moveTouch = moveEvent.touches?.[0]
          if (!moveTouch) return
          
          const deltaX = moveTouch.clientX - startX
          const deltaTime = Date.now() - startTime
          const velocity = deltaX / deltaTime
          
          if (deltaX > 50 && velocity > 0.3) {
            onOpen()
            cleanup()
          }
        }
        
        const handleTouchEnd = () => {
          cleanup()
        }
        
        const cleanup = () => {
          document.removeEventListener('touchmove', handleTouchMove)
          document.removeEventListener('touchend', handleTouchEnd)
        }
        
        document.addEventListener('touchmove', handleTouchMove, { passive: true })
        document.addEventListener('touchend', handleTouchEnd, { passive: true })
      }
    }
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
    }
  }, [onOpen])
  
  return null
}

export function MobileOverlay({ onClose }: { onClose: () => void }) {
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches?.[0]
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }
  }
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    
    const touch = e.changedTouches?.[0]
    if (!touch) return
    
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const minSwipeDistance = 60
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < -minSwipeDistance) {
        e.preventDefault()
        onClose()
      }
    }
    
    touchStartRef.current = null
  }
  
  return (
    <div 
      className="fixed inset-0 z-40 bg-black/50 2xl:hidden"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  )
}
