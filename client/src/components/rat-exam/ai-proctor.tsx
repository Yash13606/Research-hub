
import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Camera, CameraOff, CheckCircle2, Eye, Users, X, Monitor, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface AIProctorProps {
  onViolation?: (violation: string) => void
  onCameraStatus?: (status: boolean) => void
  required?: boolean
}

export function AIProctor({ onViolation, onCameraStatus, required = true }: AIProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [violations, setViolations] = useState<string[]>([])
  const [status, setStatus] = useState<"idle" | "monitoring" | "warning">("idle")
  const [facesDetected, setFacesDetected] = useState(0)
  const [eyeContact, setEyeContact] = useState(true)
  const [browserFocus, setBrowserFocus] = useState(true)
  const [networkStatus, setNetworkStatus] = useState("stable")
  const { toast } = useToast()

  // Simulated AI detection intervals
  const detectionIntervals = useRef<NodeJS.Timeout[]>([])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setCameraActive(true)
      setCameraPermission(true)
      setStatus("monitoring")

      if (onCameraStatus) {
        onCameraStatus(true)
      }

      toast({
        title: "Camera activated",
        description: "AI proctoring is now monitoring your exam session",
      })

      // Start simulated AI detection
      startSimulatedDetection()
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraPermission(false)

      if (onCameraStatus) {
        onCameraStatus(false)
      }

      toast({
        variant: "destructive",
        title: "Camera access denied",
        description: "Please allow camera access to continue with the exam",
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
      setStatus("idle")

      if (onCameraStatus) {
        onCameraStatus(false)
      }

      // Clear all detection intervals
      detectionIntervals.current.forEach((interval) => clearInterval(interval))
      detectionIntervals.current = []
    }
  }

  const startSimulatedDetection = () => {
    // Simulate face detection
    const faceDetectionInterval = setInterval(() => {
      // Randomly simulate 0, 1, or 2 faces
      const faces = Math.floor(Math.random() * 3) // 0, 1, or 2
      // Bias towards 1 face for a mostly successful test
      const biasedFaces = Math.random() > 0.1 ? 1 : faces; 
      
      setFacesDetected(biasedFaces)

      if (biasedFaces === 0) {
        reportViolation("No face detected in frame")
      } else if (biasedFaces > 1) {
        reportViolation("Multiple faces detected")
      }
    }, 5000)

    // Simulate eye tracking
    const eyeTrackingInterval = setInterval(() => {
      // 5% chance of looking away
      const lookingAway = Math.random() < 0.05
      setEyeContact(!lookingAway)

      if (lookingAway) {
        reportViolation("Looking away from screen")
      }
    }, 8000)

    // Simulate browser focus tracking (visual update only here, real tracking is in BrowserFocusTracker)
    const browserFocusInterval = setInterval(() => {
       // Just keep it focused for the visual component unless we want to simulate random focus loss
       setBrowserFocus(document.hasFocus())
    }, 1000)

    // Simulate network monitoring (visual update only)
    const networkMonitoringInterval = setInterval(() => {
        setNetworkStatus(navigator.onLine ? "stable" : "unstable")
    }, 5000)


    detectionIntervals.current = [
      faceDetectionInterval,
      eyeTrackingInterval,
      browserFocusInterval,
      networkMonitoringInterval,
    ]
  }

  const reportViolation = (violation: string) => {
    setViolations((prev) => [`${new Date().toLocaleTimeString()}: ${violation}`, ...prev])
    setStatus("warning")

    toast({
      variant: "destructive",
      title: "Proctoring Alert",
      description: violation,
    })

    if (onViolation) {
      onViolation(violation)
    }

    // Reset status after a few seconds
    setTimeout(() => {
      if (cameraActive) {
        setStatus("monitoring")
      }
    }, 5000)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <Card className="overflow-hidden border-gray-700 bg-[#0A1A2F]/80 backdrop-blur-md">
      <CardHeader className="bg-muted/10 border-b border-gray-700">
        <CardTitle className="flex items-center text-white">
          <Camera className="mr-2 h-5 w-5 text-blue-400" />
          AI Proctoring System
        </CardTitle>
        <CardDescription className="text-gray-400">Real-time monitoring to ensure exam integrity</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden bg-black">
          {cameraActive ? (
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover transform scale-x-[-1]" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-900">
              <CameraOff className="h-12 w-12 text-gray-600" />
            </div>
          )}

          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          {status !== "idle" && (
            <div
              className={cn(
                "absolute bottom-2 right-2 flex items-center rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md",
                status === "monitoring" ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30",
              )}
            >
              {status === "monitoring" ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Monitoring
                </>
              ) : (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Warning
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="flex justify-center">
            {!cameraActive ? (
              <Button onClick={startCamera} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Start Camera
              </Button>
            ) : (
              <Button variant="outline" onClick={stopCamera} className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                Stop Camera
              </Button>
            )}
          </div>

          {required && !cameraActive && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-900/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400">Camera Required</AlertTitle>
              <AlertDescription className="text-red-300">You must enable your camera to proceed with the exam.</AlertDescription>
            </Alert>
          )}

          {cameraPermission === false && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-900/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400">Camera Access Denied</AlertTitle>
              <AlertDescription className="text-red-300">
                Please allow camera access in your browser settings and refresh the page.
              </AlertDescription>
            </Alert>
          )}

          {cameraActive && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-md border p-2 bg-gray-800/50 border-gray-700",
                    facesDetected === 1 ? "border-green-500/30" : "border-red-500/30",
                  )}
                >
                  <div className="flex items-center">
                    <Users className={cn("mr-2 h-4 w-4", facesDetected === 1 ? "text-green-500" : "text-red-500")} />
                    <span className="text-sm font-medium text-gray-300">Face Detection</span>
                  </div>
                  <span className={cn("text-sm font-medium", facesDetected === 1 ? "text-green-500" : "text-red-500")}>
                    {facesDetected === 0 ? "No face" : facesDetected === 1 ? "Detected" : "Multiple"}
                  </span>
                </div>

                <div
                  className={cn(
                    "flex items-center justify-between rounded-md border p-2 bg-gray-800/50 border-gray-700",
                    eyeContact ? "border-green-500/30" : "border-red-500/30",
                  )}
                >
                  <div className="flex items-center">
                    <Eye className={cn("mr-2 h-4 w-4", eyeContact ? "text-green-500" : "text-red-500")} />
                    <span className="text-sm font-medium text-gray-300">Eye Contact</span>
                  </div>
                  <span className={cn("text-sm font-medium", eyeContact ? "text-green-500" : "text-red-500")}>
                    {eyeContact ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-md border p-2 bg-gray-800/50 border-gray-700",
                    browserFocus ? "border-green-500/30" : "border-red-500/30",
                  )}
                >
                  <div className="flex items-center">
                    <Monitor className={cn("mr-2 h-4 w-4", browserFocus ? "text-green-500" : "text-red-500")} />
                    <span className="text-sm font-medium text-gray-300">Focus</span>
                  </div>
                  <span className={cn("text-sm font-medium", browserFocus ? "text-green-500" : "text-red-500")}>
                    {browserFocus ? "Active" : "Lost"}
                  </span>
                </div>

                <div
                  className={cn(
                    "flex items-center justify-between rounded-md border p-2 bg-gray-800/50 border-gray-700",
                    networkStatus === "stable" ? "border-green-500/30" : "border-red-500/30",
                  )}
                >
                  <div className="flex items-center">
                    <Wifi
                      className={cn("mr-2 h-4 w-4", networkStatus === "stable" ? "text-green-500" : "text-red-500")}
                    />
                    <span className="text-sm font-medium text-gray-300">Net</span>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      networkStatus === "stable" ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {networkStatus === "stable" ? "Ok" : "Weak"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {violations.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-xs font-medium text-red-400 uppercase tracking-wider">Violation Log:</h3>
              <div className="max-h-32 overflow-y-auto rounded-md border border-gray-700 bg-black/20 p-2">
                <ul className="space-y-1 text-sm">
                  {violations.map((violation, index) => (
                    <li key={index} className="text-red-400/90 flex items-start text-xs border-b border-white/5 pb-1 mb-1 last:border-0">
                      <X className="mr-1 h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{violation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
