import { ref, onMounted, onUnmounted } from 'vue'

export function useDrag() {
  const dragState = ref({
    isDragging: false,
    draggedItem: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    lastTime: 0,
    shakeOffset: { x: 0, y: 0 }
  })

  let shakeAnimationFrame: number | null = null

  const startShakeAnimation = (hostName: string) => {
    const shake = () => {
      if (!dragState.value.isDragging || dragState.value.draggedItem !== hostName) {
        return
      }

      const distance = Math.sqrt(
        dragState.value.offsetX ** 2 + dragState.value.offsetY ** 2
      )

      const shakeIntensity = Math.min(distance / 50, 1) * 3

      dragState.value.shakeOffset.x = (Math.random() - 0.5) * shakeIntensity * 2
      dragState.value.shakeOffset.y = (Math.random() - 0.5) * shakeIntensity * 2

      shakeAnimationFrame = requestAnimationFrame(shake)
    }

    shakeAnimationFrame = requestAnimationFrame(shake)
  }

  const handleDragStart = (e: MouseEvent | TouchEvent, hostName: string) => {
    const card = e.currentTarget as HTMLElement

    dragState.value = {
      isDragging: true,
      draggedItem: hostName,
      startX: (e as MouseEvent).clientX || (e as TouchEvent).touches?.[0]?.clientX || 0,
      startY: (e as MouseEvent).clientY || (e as TouchEvent).touches?.[0]?.clientY || 0,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      lastTime: Date.now(),
      shakeOffset: { x: 0, y: 0 }
    }

    card.style.transition = 'none'
    card.style.zIndex = '100'
    card.style.cursor = 'grabbing'

    startShakeAnimation(hostName)
  }

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragState.value.isDragging) return

    if (e.type === 'touchmove') {
      e.preventDefault()
    }

    const clientX = (e as MouseEvent).clientX || (e as TouchEvent).touches?.[0]?.clientX || 0
    const clientY = (e as MouseEvent).clientY || (e as TouchEvent).touches?.[0]?.clientY || 0

    const deltaX = clientX - dragState.value.startX
    const deltaY = clientY - dragState.value.startY

    dragState.value.offsetX = deltaX
    dragState.value.offsetY = deltaY

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = 60
    const ratio = Math.min(distance / maxDistance, 1)

    const angle = Math.atan2(deltaY, deltaX)

    const tearThreshold = 0.7
    const isTearing = ratio > tearThreshold

    const stretchFactor = ratio * 0.35
    const squashFactor = ratio * 0.25

    const tearMultiplier = isTearing ? 1.5 : 1
    const finalStretch = stretchFactor * tearMultiplier
    const finalSquash = squashFactor * tearMultiplier

    const scaleX = 1 - Math.abs(Math.cos(angle)) * finalSquash
    const scaleY = 1 - Math.abs(Math.sin(angle)) * finalSquash + finalStretch

    const skewIntensity = isTearing ? 0.25 : 0.15
    const skewX = Math.cos(angle) * ratio * skewIntensity * 20
    const skewY = Math.sin(angle) * ratio * skewIntensity * 12

    const swingIntensity = isTearing ? 0.08 : 0.05
    const rotateX = -deltaY * swingIntensity
    const rotateY = deltaX * swingIntensity

    const shakeX = dragState.value.shakeOffset.x
    const shakeY = dragState.value.shakeOffset.y

    const translateZ = ratio * (isTearing ? 50 : 30)

    const card = document.querySelector(`[data-host="${dragState.value.draggedItem}"]`) as HTMLElement
    if (card) {
      card.style.transform = `translate3d(${deltaX + shakeX}px, ${deltaY + shakeY}px, ${translateZ}px) 
                               scale(${scaleX}, ${scaleY}) 
                               skew(${skewX}deg, ${skewY}deg) 
                               rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

      if (isTearing) {
        const shadowBlur1 = 15 + ratio * 40
        const shadowBlur2 = 8 + ratio * 20
        const offsetX = Math.cos(angle) * ratio * 8
        const offsetY = Math.sin(angle) * ratio * 8
        card.style.boxShadow = `
          ${offsetX}px ${offsetY}px ${shadowBlur1}px rgba(0,0,0,${0.2 + ratio * 0.3}),
          ${-offsetX * 0.5}px ${-offsetY * 0.5}px ${shadowBlur2}px rgba(0,0,0,${0.15 + ratio * 0.2}),
          0 ${5 + ratio * 20}px ${shadowBlur1}px rgba(0,0,0,0.1)`
      } else {
        const shadowBlur = 10 + ratio * 30
        const shadowOffsetY = 3 + ratio * 15
        card.style.boxShadow = `0 ${shadowOffsetY}px ${shadowBlur}px rgba(0,0,0,${0.15 + ratio * 0.25}), 
                                0 2px 6px rgba(0,0,0,0.08)`
      }

      const baseRadius = 12
      if (isTearing) {
        const tearRadius = ratio * 15
        const radius1 = baseRadius - Math.abs(Math.cos(angle + 0.5)) * tearRadius
        const radius2 = baseRadius + Math.abs(Math.cos(angle - 0.5)) * tearRadius
        const radius3 = baseRadius - Math.abs(Math.sin(angle + 0.5)) * tearRadius
        const radius4 = baseRadius + Math.abs(Math.sin(angle - 0.5)) * tearRadius
        card.style.borderRadius = `${Math.max(radius1, 2)}px ${Math.max(radius2, 2)}px ${Math.max(radius3, 2)}px ${Math.max(radius4, 2)}px`
      } else {
        const radiusDeform = ratio * 8
        const radiusX = baseRadius + Math.abs(Math.cos(angle)) * radiusDeform
        const radiusY = baseRadius + Math.abs(Math.sin(angle)) * radiusDeform
        card.style.borderRadius = `${radiusY}px ${radiusX}px ${radiusY}px ${radiusX}px`
      }

      const perspectiveX = 50 + deltaX * (isTearing ? 0.1 : 0.05)
      const perspectiveY = 50 + deltaY * (isTearing ? 0.1 : 0.05)
      card.style.perspectiveOrigin = `${perspectiveX}% ${perspectiveY}%`

      if (isTearing) {
        card.style.border = `1px solid rgba(${dragState.value.offsetX > 0 ? '22, 93, 255' : '245, 63, 63'}, ${ratio * 0.3})`
      } else {
        card.style.border = 'none'
      }
    }
  }

  const handleDragEnd = () => {
    if (!dragState.value.isDragging) return

    if (shakeAnimationFrame) {
      cancelAnimationFrame(shakeAnimationFrame)
      shakeAnimationFrame = null
    }

    const card = document.querySelector(`[data-host="${dragState.value.draggedItem}"]`) as HTMLElement
    if (card) {
      card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease, border-radius 0.4s ease, border 0.4s ease'
      card.style.transform = 'translate3d(0, 0, 0) scale(1) skew(0, 0) rotateX(0) rotateY(0)'
      card.style.zIndex = ''
      card.style.cursor = 'grab'

      card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
      card.style.borderRadius = '12px'
      card.style.perspectiveOrigin = '50% 50%'
      card.style.border = 'none'

      setTimeout(() => {
        card.style.transition = ''
      }, 600)
    }

    dragState.value = {
      isDragging: false,
      draggedItem: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      lastTime: 0,
      shakeOffset: { x: 0, y: 0 }
    }
  }

  onMounted(() => {
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchmove', handleDragMove, { passive: false })
    document.addEventListener('touchend', handleDragEnd)
  })

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('touchend', handleDragEnd)
  })

  return {
    dragState,
    handleDragStart
  }
}