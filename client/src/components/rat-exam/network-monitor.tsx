
import { useEffect, useRef, useState } from "react"

interface NetworkMonitorProps {
  onViolation: (violation: string) => void
}

export function NetworkMonitor({ onViolation }: NetworkMonitorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [violations, setViolations] = useState(0)
  const lastNetworkType = useRef<string | null>(null)
  const connectionChecks = useRef<number>(0)
  const suspiciousActivityCount = useRef<number>(0)

  useEffect(() => {
    // Track online/offline status
    const handleOnline = () => {
      setIsOnline(true)

      // If we were offline and suddenly online, might indicate network switching
      if (!isOnline) {
        setViolations((prev) => prev + 1)
        onViolation("Network connection changed - possible proxy switching")
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Check for connection type changes (if supported by browser)
    const checkConnectionType = () => {
      // @ts-ignore - Connection property might not be available in all browsers
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

      if (connection) {
        const currentType = connection.type || connection.effectiveType

        // If this is the first check, just store the value
        if (lastNetworkType.current === null) {
          lastNetworkType.current = currentType
          return
        }

        // If connection type changed, might indicate network switching
        if (currentType !== lastNetworkType.current) {
          setViolations((prev) => prev + 1)
          onViolation(`Network type changed from ${lastNetworkType.current} to ${currentType}`)
          lastNetworkType.current = currentType
        }
      }

      // Increment connection check counter
      connectionChecks.current += 1

      // Simulate detection of unusual network patterns
      // In a real implementation, this would analyze actual network traffic patterns
      if (connectionChecks.current % 10 === 0) {
        // Randomly detect suspicious activity (10% chance)
        if (Math.random() < 0.1) {
          suspiciousActivityCount.current += 1
          setViolations((prev) => prev + 1)
          onViolation("Unusual network traffic pattern detected")
        }
      }
    }

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set up periodic connection checks
    const intervalId = setInterval(checkConnectionType, 5000)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(intervalId)
    }
  }, [onViolation, isOnline])

  // This component doesn't render anything visible
  return null
}
