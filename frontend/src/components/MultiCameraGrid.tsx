import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Video,
  VideoOff,
  AlertTriangle,
  Settings,
  RefreshCw,
  Maximize2,
  Grid3x3,
} from "lucide-react";

interface CameraFeed {
  id: string;
  name: string;
  type: string;
  source: string | number;
  url: string;
  active: boolean;
  status: "idle" | "streaming" | "error";
  region?: string;
}

export function MultiCameraGrid() {
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [layout, setLayout] = useState<"2x2" | "1x4">("2x2");
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch(`${apiUrl}/camera/sources`);
      const data = await response.json();

      const cameraFeeds: CameraFeed[] = data.sources.map(
        (source: any, index: number) => ({
          id: `${source.type}-${source.index || source.url}-${index}`,
          name: source.name,
          type: source.type,
          source: source.index || source.url,
          url:
            source.type === "local"
              ? `${apiUrl}/video_feed?source=${source.index}&t=${Date.now()}`
              : `${apiUrl}/video_feed?source=${encodeURIComponent(
                  source.url
                )}&t=${Date.now()}`,
          active: source.active || false,
          status: "idle",
          region: extractRegion(source.name),
        })
      );

      setCameras(cameraFeeds);
    } catch (error) {
      console.error("Error fetching cameras:", error);
      setError("Failed to load cameras");
    }
  };

  const extractRegion = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("north")) return "North";
    if (lowerName.includes("east")) return "East";
    if (lowerName.includes("south")) return "South";
    if (lowerName.includes("west")) return "West";
    if (lowerName.includes("central") || lowerName.includes("main"))
      return "Central";
    return "Unknown";
  };

  const toggleCamera = (cameraId: string) => {
    setSelectedCameras((prev) => {
      if (prev.includes(cameraId)) {
        return prev.filter((id) => id !== cameraId);
      } else {
        // Limit based on layout (both 2x2 and 1x4 support max 4 cameras)
        const maxCameras = 4;
        if (prev.length >= maxCameras) {
          return [...prev.slice(1), cameraId]; // Remove oldest, add newest
        }
        return [...prev, cameraId];
      }
    });
  };

  const startAllCameras = () => {
    setIsStreaming(true);
    setError(null);
  };

  const stopAllCameras = () => {
    setIsStreaming(false);
    // Clear all image sources
    selectedCameras.forEach((cameraId) => {
      const imgElement = document.getElementById(
        `camera-img-${cameraId}`
      ) as HTMLImageElement;
      if (imgElement) {
        imgElement.src = "";
      }
    });
  };

  const getGridClass = () => {
    switch (layout) {
      case "2x2":
        return "grid-cols-2 grid-rows-2";
      case "1x4":
        return "grid-cols-4 grid-rows-1";
      default:
        return "grid-cols-2 grid-rows-2";
    }
  };

  const selectedCameraData = cameras.filter((cam) =>
    selectedCameras.includes(cam.id)
  );

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Grid3x3 className="h-5 w-5" />
              Multi-Camera Regional Monitoring
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchCameras}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              {isStreaming ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopAllCameras}
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  <VideoOff className="h-4 w-4 mr-2" />
                  Stop All Cameras
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={startAllCameras}
                  disabled={selectedCameras.length === 0}
                  className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Selected ({selectedCameras.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Layout Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Layout:</span>
            <Button
              size="sm"
              variant={layout === "2x2" ? "default" : "outline"}
              onClick={() => setLayout("2x2")}
              className={
                layout === "2x2"
                  ? "bg-[#FF7A00]"
                  : "border-gray-700 text-gray-300"
              }
            >
              2×2 Grid
            </Button>
            <Button
              size="sm"
              variant={layout === "1x4" ? "default" : "outline"}
              onClick={() => setLayout("1x4")}
              className={
                layout === "1x4"
                  ? "bg-[#FF7A00]"
                  : "border-gray-700 text-gray-300"
              }
            >
              1×4 Row
            </Button>
          </div>

          {/* Camera Selection */}
          <div className="space-y-2">
            <span className="text-sm text-gray-400">
              Select Cameras by Region:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {cameras.map((camera) => (
                <Button
                  key={camera.id}
                  size="sm"
                  variant={
                    selectedCameras.includes(camera.id) ? "default" : "outline"
                  }
                  onClick={() => toggleCamera(camera.id)}
                  className={
                    selectedCameras.includes(camera.id)
                      ? "bg-[#FF7A00] text-white"
                      : "border-gray-700 text-gray-300 hover:bg-gray-800"
                  }
                >
                  <Video className="h-3 w-3 mr-1" />
                  {camera.name}
                  {camera.region !== "Unknown" && (
                    <Badge className="ml-2 text-xs bg-blue-500/20 text-blue-400">
                      {camera.region}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/50">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Camera Grid */}
      {selectedCameras.length > 0 ? (
        <div className={`grid gap-4 ${getGridClass()}`}>
          {selectedCameraData.map((camera) => (
            <Card
              key={camera.id}
              className="bg-gray-900 border-gray-800 overflow-hidden"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    {camera.name}
                    {camera.region !== "Unknown" && (
                      <Badge className="bg-[#FF7A00] text-white text-xs">
                        {camera.region}
                      </Badge>
                    )}
                  </CardTitle>
                  {isStreaming && (
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-500 bg-green-500/10 text-xs"
                    >
                      Live
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
                  {isStreaming ? (
                    <img
                      id={`camera-img-${camera.id}`}
                      src={camera.url}
                      alt={camera.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load ${camera.name}`);
                        (e.target as HTMLImageElement).src = "";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                      <Video className="h-12 w-12 mb-2" />
                      <p className="text-xs">Click "Start Selected" to begin</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Grid3x3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No Cameras Selected</p>
              <p className="text-sm">
                Select cameras from the region buttons above to begin
                multi-camera monitoring
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-500/10 border-blue-500/50">
        <CardContent className="pt-4">
          <h4 className="text-sm font-medium text-blue-400 mb-2">
            📱 How to Set Up Regional Phone Cameras:
          </h4>
          <ol className="text-xs text-blue-300 space-y-1 list-decimal list-inside">
            <li>Install IP Webcam on each phone you want to use</li>
            <li>
              Position phones in different regions: North, East, South, West,
              etc.
            </li>
            <li>
              Name each camera in Settings → Cameras (e.g., "Phone - North
              Entrance")
            </li>
            <li>Add each phone: http://PHONE_IP:8080/video</li>
            <li>Return here and select cameras by region</li>
            <li>
              Click "Start Selected" to monitor all regions simultaneously!
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
