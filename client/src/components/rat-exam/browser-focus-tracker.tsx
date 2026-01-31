
import { useEffect, useState } from "react"

interface BrowserFocusTrackerProps {
  onViolation: (violation: string) => void
}

export function BrowserFocusTracker({ onViolation }: BrowserFocusTrackerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [violations, setViolations] = useState(0)

  useEffect(() => {
    // Track visibility changes (tab switching)
    const handleVisibilityChange = () => {
      const isNowVisible = !document.hidden

      if (!isNowVisible) {
        // Tab is not visible (user switched tabs)
        setViolations((prev) => prev + 1)
        onViolation("Tab focus lost - possible attempt to access other resources")
      }

      setIsVisible(isNowVisible)
    }

    // Track window focus
    const handleFocus = () => {
      setIsVisible(true)
    }

    const handleBlur = () => {
      setIsVisible(false)
      setViolations((prev) => prev + 1)
      onViolation("Window focus lost - possible attempt to access other applications")
    }

    // Track window resize (to detect minimizing)
    const handleResize = () => {
      // Check if window is smaller than expected (might be minimized)
      if (window.outerHeight < 200 || window.outerWidth < 200) {
        setViolations((prev) => prev + 1)
        onViolation("Window minimized or significantly resized")
      }
    }

    // Track fullscreen changes
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement
      setIsFullscreen(isNowFullscreen)

      if (!isNowFullscreen && isFullscreen) {
        // User exited fullscreen mode
        setViolations((prev) => prev + 1)
        onViolation("Fullscreen mode exited")
      }
    }

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("resize", handleResize)
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    // Clean up
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [onViolation, isFullscreen])

  // This component doesn't render anything visible
  return null
}
