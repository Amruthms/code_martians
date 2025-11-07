import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Camera,
  Smartphone,
  Video,
  Globe,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface CameraSource {
  type: "local" | "ip" | "rtsp";
  index?: number;
  url?: string;
  name: string;
  available?: boolean;
  active?: boolean;
}

export function CameraSettings() {
  const [sources, setSources] = useState<CameraSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({
    type: "ip" as "local" | "ip" | "rtsp",
    url: "",
    name: "",
  });

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchCameraSources();
  }, []);

  const fetchCameraSources = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/camera/sources`);
      const data = await response.json();
      setSources(data.sources || []);
    } catch (error) {
      console.error("Error fetching camera sources:", error);
      setMessage({ type: "error", text: "Failed to fetch camera sources" });
    } finally {
      setLoading(false);
    }
  };

  const switchCamera = async (source: CameraSource) => {
    setLoading(true);
    setMessage(null);
    try {
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
        setMessage({ type: "success", text: `Switched to ${source.name}` });
        fetchCameraSources();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const addCustomSource = () => {
    if (!newSource.name || !newSource.url) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    const customSource: CameraSource = {
      type: newSource.type,
      url: newSource.url,
      name: newSource.name,
      available: true,
      active: false,
    };

    switchCamera(customSource);
    setShowAddForm(false);
    setNewSource({ type: "ip", url: "", name: "" });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Camera Sources
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage multiple cameras for different zones
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchCameraSources}
                disabled={loading}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Phone Camera
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert
              className={
                message.type === "success"
                  ? "bg-green-500/10 border-green-500/50"
                  : "bg-red-500/10 border-red-500/50"
              }
            >
              <AlertDescription
                className={
                  message.type === "success" ? "text-green-400" : "text-red-400"
                }
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {showAddForm && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Camera Type</Label>
                  <select
                    value={newSource.type}
                    onChange={(e) =>
                      setNewSource({
                        ...newSource,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
                  >
                    <option value="ip">IP Camera (Phone)</option>
                    <option value="rtsp">RTSP Stream</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Camera Name</Label>
                  <Input
                    placeholder="e.g., Phone - Zone 1"
                    value={newSource.name}
                    onChange={(e) =>
                      setNewSource({ ...newSource, name: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Camera URL</Label>
                  <Input
                    placeholder={
                      newSource.type === "ip"
                        ? "http://192.168.1.100:8080/video"
                        : "rtsp://192.168.1.100:8554/stream"
                    }
                    value={newSource.url}
                    onChange={(e) =>
                      setNewSource({ ...newSource, url: e.target.value })
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500">
                    {newSource.type === "ip"
                      ? "Use IP Webcam app on Android. Format: http://PHONE_IP:8080/video"
                      : "RTSP stream URL from your camera"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={addCustomSource}
                    className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90"
                  >
                    Connect Camera
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400">
              Available Cameras
            </h3>
            <div className="grid gap-2">
              {sources.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No cameras detected. Click refresh or add a phone camera.
                </p>
              ) : (
                sources.map((source, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      source.active
                        ? "bg-[#FF7A00]/10 border-[#FF7A00]"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {source.type === "local" ? (
                        <Video className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Smartphone className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">{source.name}</p>
                        <p className="text-xs text-gray-500">
                          {source.type === "local"
                            ? `Index: ${source.index}`
                            : source.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {source.active ? (
                        <Badge className="bg-[#FF7A00] text-white">
                          Active
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => switchCamera(source)}
                          disabled={loading}
                          className="bg-gray-700 text-white hover:bg-gray-600"
                        >
                          Switch
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Card className="bg-blue-500/10 border-blue-500/50">
            <CardContent className="pt-4">
              <h4 className="text-sm font-medium text-blue-400 mb-2">
                📱 How to use your phone as a camera:
              </h4>
              <ol className="text-xs text-blue-300 space-y-1 list-decimal list-inside">
                <li>Install "IP Webcam" app from Google Play Store</li>
                <li>Open the app and scroll down, tap "Start Server"</li>
                <li>Note the URL shown (e.g., http://192.168.1.100:8080)</li>
                <li>
                  Click "Add Phone Camera" above and enter:
                  http://PHONE_IP:8080/video
                </li>
                <li>
                  Make sure phone and computer are on the same WiFi network
                </li>
              </ol>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
