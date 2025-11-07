import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Video,
  VideoOff,
  AlertTriangle,
  CheckCircle2,
  Info,
  Camera,
} from "lucide-react";
import { detectHelmet } from "../services/helmetDetection";
import { useApp } from "../context/AppContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function WebcamDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamKey, setStreamKey] = useState(0); // Force img re-render
  const [cameraSources, setCameraSources] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [detectionStatus, setDetectionStatus] = useState<{
    personDetected: boolean;
    helmetDetected: boolean;
    confidence: number;
  }>({
    personDetected: false,
    helmetDetected: true,
    confidence: 0,
  });
  const detectionIntervalRef = useRef<number | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const { addAlert, updateCameraFeed } = useApp();

  useEffect(() => {
    fetchCameraSources();
    return () => {
      stopWebcam();
    };
  }, []);

  const fetchCameraSources = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/camera/sources`);
      const data = await response.json();
      setCameraSources(data.sources || []);

      // Find and set the active camera
      const active = data.sources?.find((s: any) => s.active);
      if (active) {
        setSelectedCamera(`${active.type}-${active.index || active.url}`);
      }
    } catch (error) {
      console.error("Error fetching camera sources:", error);
    }
  };

  const switchCamera = async (value: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const source = cameraSources.find(
        (s) => `${s.type}-${s.index || s.url}` === value
      );

      if (!source) return;

      const payload =
        source.type === "local"
          ? { type: "local", index: source.index }
          : { type: source.type, url: source.url };

      const response = await fetch(`${apiUrl}/camera/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.status === "success") {
        setSelectedCamera(value);
        // If camera is streaming, restart it with new source
        if (isStreaming) {
          stopWebcam();
          setTimeout(() => startWebcam(), 500);
        }
      }
    } catch (error) {
      console.error("Error switching camera:", error);
      setError("Failed to switch camera");
    }
  };

  const startWebcam = async () => {
    try {
      setError(null);
      setIsLoadingModel(true);
      console.log("🎥 Starting webcam...");

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      // First, verify the backend is accessible
      try {
        console.log("🔍 Checking backend health...");
        const healthCheck = await fetch(`${apiUrl}/docs`, { method: 'HEAD' });
        if (!healthCheck.ok) {
          throw new Error("Backend server is not responding");
        }
        console.log("✅ Backend is running");
      } catch (err) {
        console.error("❌ Backend check failed:", err);
        setError("Cannot connect to backend server. Please ensure it's running on port 8000.");
        setIsLoadingModel(false);
        return;
      }

      // Set the image source to the video feed endpoint
      if (imgRef.current) {
        console.log("🎬 Setting up video stream...");
        
        // Force a new key to ensure fresh render
        const newKey = Date.now();
        setStreamKey(newKey);

        // Wait for React to re-render with new key
        await new Promise(resolve => setTimeout(resolve, 50));

        // Now set the src directly on the DOM element
        const streamUrl = `${apiUrl}/video_feed?cache=${newKey}`;
        console.log("📡 Setting stream URL:", streamUrl);
        
        if (imgRef.current) {
          imgRef.current.src = streamUrl;
          console.log("✅ Image src set directly on DOM");
        }

        // Immediately show as streaming (MJPEG doesn't fire onload reliably)
        setTimeout(() => {
          console.log("⚡ Activating stream display");
          setIsStreaming(true);
          setIsLoadingModel(false);
          setError(null);
          updateCameraFeed(9, { streamActive: true, status: "safe" });
          startStatusPolling();
        }, 500);
      }
    } catch (error: any) {
      console.error("❌ Error starting vision processing:", error);

      let errorMessage = "Unable to start vision processing. ";
      errorMessage +=
        error.message || "Please ensure the backend is running and try again.";

      setError(errorMessage);
      setIsStreaming(false);
      setIsLoadingModel(false);
    }
  };
  const stopWebcam = async () => {
    // First update UI state
    setIsStreaming(false);
    setError(null); // Clear error immediately
    updateCameraFeed(9, { streamActive: false, status: "safe" });

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    try {
      // Stop the video stream by removing the src and setting a blank image
      if (imgRef.current) {
        imgRef.current.src =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
      }

      // Call backend to release the camera hardware (delayed to prevent issues on restart)
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      setTimeout(async () => {
        try {
          const response = await fetch(`${apiUrl}/camera/release`, {
            method: "POST",
          });
          const data = await response.json();
          console.log("Camera release:", data);
        } catch (error) {
          console.error("Error releasing camera:", error);
        }
      }, 500);
    } catch (error) {
      console.error("Error stopping vision processing:", error);
    }
  };

  const startStatusPolling = () => {
    // Poll for alerts and update status
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = window.setInterval(async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

        // Fetch latest alerts
        const alertsResponse = await fetch(`${apiUrl}/alerts`);
        const alertsData = await alertsResponse.json();

        if (alertsData.data && alertsData.data.length > 0) {
          const latestAlert = alertsData.data[alertsData.data.length - 1];

          // Update detection status based on alerts
          if (
            latestAlert.type === "no_helmet" ||
            latestAlert.type === "NO_HELMET"
          ) {
            setDetectionStatus({
              personDetected: true,
              helmetDetected: false,
              confidence: 0.9,
            });
          } else {
            setDetectionStatus({
              personDetected: true,
              helmetDetected: true,
              confidence: 0.9,
            });
          }
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const startDetection = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Pre-load the model before starting detection
    setIsLoadingModel(true);
    try {
      const { loadModel } = await import("../services/helmetDetection");
      await loadModel();
    } catch (error) {
      console.error("Failed to load detection model:", error);
      setIsLoadingModel(false);
      return;
    }
    setIsLoadingModel(false);

    const detectFrame = async () => {
      if (!videoRef.current || !isStreaming) return;

      try {
        const result = await detectHelmet(videoRef.current);
        setDetectionStatus({
          personDetected: result.personDetected,
          helmetDetected: result.helmetDetected,
          confidence: result.confidence,
        });

        // Draw detections on canvas
        drawDetections(result.detections);

        // Trigger alert if person detected without helmet
        const now = Date.now();
        if (result.personDetected && !result.helmetDetected) {
          // Only send alert if 5 seconds have passed since last alert
          if (now - lastAlertTimeRef.current > 5000) {
            lastAlertTimeRef.current = now;

            addAlert({
              time: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              zone: "Live Webcam",
              type: "Helmet Missing",
              severity: "high",
              status: "pending",
              assignedTo: "Supervisor Anna",
              worker: "Unknown Worker",
              confidence: result.confidence,
            });

            updateCameraFeed(9, {
              status: "danger",
              alerts: ["Helmet Missing Detected"],
              workers: 1,
            });
          }
        } else if (result.personDetected && result.helmetDetected) {
          updateCameraFeed(9, {
            status: "safe",
            alerts: [],
            workers: 1,
          });
        }
      } catch (error) {
        console.error("Detection error:", error);
      }
    };

    // Run detection every 2 seconds
    detectionIntervalRef.current = window.setInterval(detectFrame, 2000);
  };

  const drawDetections = (detections: any[]) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding boxes
    detections.forEach((detection) => {
      const [x, y, width, height] = detection.bbox;

      // Draw box
      ctx.strokeStyle =
        detection.className === "person" ? "#FF7A00" : "#22C55E";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      ctx.fillStyle = detection.className === "person" ? "#FF7A00" : "#22C55E";
      const label = `${detection.className} ${Math.round(
        detection.score * 100
      )}%`;
      ctx.font = "16px Arial";
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y - 25, textWidth + 10, 25);

      // Draw label text
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(label, x + 5, y - 7);
    });
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Live Webcam Detection</CardTitle>
          <div className="flex items-center gap-2">
            {cameraSources.length > 1 && (
              <Select value={selectedCamera} onValueChange={switchCamera}>
                <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
                  <Camera className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {cameraSources.map((source, idx) => (
                    <SelectItem
                      key={idx}
                      value={`${source.type}-${source.index || source.url}`}
                      className="text-white hover:bg-gray-700"
                    >
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {isStreaming && (
              <Badge
                variant="outline"
                className={
                  detectionStatus.personDetected &&
                  !detectionStatus.helmetDetected
                    ? "border-red-500 text-red-500 bg-red-500/10"
                    : detectionStatus.personDetected
                    ? "border-green-500 text-green-500 bg-green-500/10"
                    : "border-gray-500 text-gray-400"
                }
              >
                {detectionStatus.personDetected &&
                  !detectionStatus.helmetDetected && (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      No Helmet
                    </>
                  )}
                {detectionStatus.personDetected &&
                  detectionStatus.helmetDetected && (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Helmet OK
                    </>
                  )}
                {!detectionStatus.personDetected && "No Person"}
              </Badge>
            )}
            {isStreaming ? (
              <Button
                size="sm"
                variant="outline"
                onClick={stopWebcam}
                className="border-red-500 text-red-500 hover:bg-red-500/10"
              >
                <VideoOff className="h-4 w-4 mr-2" />
                Stop OpenCV Camera
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={startWebcam}
                disabled={isLoadingModel}
                className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90"
              >
                <Video className="h-4 w-4 mr-2" />
                {isLoadingModel ? "Starting..." : "Start OpenCV Camera"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isStreaming && !error && (
          <Alert className="mb-4 bg-blue-950/30 border-blue-800">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200 text-sm">
              Click "Start OpenCV Camera" to begin live PPE detection using the
              OpenCV vision processing system. The system will detect helmets,
              vests, and zone intrusions in real-time.
            </AlertDescription>
          </Alert>
        )}

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {/* MJPEG stream - direct img tag (works in most browsers) */}
          <img
            key={streamKey}
            ref={imgRef}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ 
              display: 'block'
            }}
            alt="Live Camera Feed"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ display: "none" }}
          />

          {/* Debug info overlay when streaming but image might not be visible */}
          {isStreaming && imgRef.current && (
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-white space-y-1">
              <div>Stream URL: {imgRef.current.src ? '✅ Set' : '❌ Not Set'}</div>
              <div>Image Loaded: {imgRef.current.complete ? '✅ Yes' : '⏳ Loading...'}</div>
              <div>Natural Size: {imgRef.current.naturalWidth}x{imgRef.current.naturalHeight}</div>
              {imgRef.current.naturalWidth === 0 && (
                <button
                  onClick={() => window.open(imgRef.current?.src, '_blank', 'width=1280,height=720')}
                  className="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white text-xs"
                >
                  📺 Open in New Window
                </button>
              )}
            </div>
          )}

          {!isStreaming && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Video className="h-16 w-16 mb-4" />
              <p className="text-sm">
                Click "Start OpenCV Camera" to begin PPE detection
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Using OpenCV Vision Processing System
              </p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertTriangle className="h-16 w-16 mb-4 text-red-400" />
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <Button
                size="sm"
                onClick={startWebcam}
                className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90"
              >
                <Video className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {isLoadingModel && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A00] mb-4"></div>
              <p className="text-white text-sm">
                Loading AI Detection Model...
              </p>
              <p className="text-gray-400 text-xs mt-2">
                This may take a few seconds
              </p>
            </div>
          )}

          {isStreaming && !isLoadingModel && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg">
              <div className="text-white text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span>LIVE</span>
                </div>
                {detectionStatus.personDetected && (
                  <div className="text-xs text-gray-300">
                    Confidence: {Math.round(detectionStatus.confidence)}%
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Person Detected:</span>
            <span
              className={
                detectionStatus.personDetected
                  ? "text-green-400"
                  : "text-gray-500"
              }
            >
              {detectionStatus.personDetected ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Helmet Detected:</span>
            <span
              className={
                detectionStatus.helmetDetected
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {detectionStatus.personDetected
                ? detectionStatus.helmetDetected
                  ? "Yes"
                  : "No"
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Detection Confidence:</span>
            <span className="text-white">
              {detectionStatus.personDetected
                ? `${Math.round(detectionStatus.confidence)}%`
                : "N/A"}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
            <p className="text-sm text-yellow-300 mb-2">
              <strong>How to enable camera access:</strong>
            </p>
            <ul className="text-xs text-yellow-200 space-y-1 list-disc list-inside">
              <li>Click the camera icon in your browser's address bar</li>
              <li>Select "Allow" for camera permissions</li>
              <li>Refresh the page if needed</li>
              <li>Make sure no other application is using the camera</li>
            </ul>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <p className="text-xs text-blue-300">
            <strong>Note:</strong> This demo uses TensorFlow.js COCO-SSD for
            person detection. For production, use a custom-trained model
            specifically for helmet/PPE detection with higher accuracy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
