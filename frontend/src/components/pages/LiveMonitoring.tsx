import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Video,
  AlertTriangle,
  Bell,
  XCircle,
  HardHat,
  Shirt,
  User,
  Grid3x3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useApp } from "../../context/AppContext";
import { WebcamDetection } from "../WebcamDetection";
import { MultiCameraGrid } from "../MultiCameraGrid";

export function LiveMonitoring() {
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedPPE, setSelectedPPE] = useState<string[]>([
    "helmet",
    "vest",
    "harness",
  ]);
  const { cameraFeeds, updateCameraFeed } = useApp();

  const filteredFeeds =
    selectedZone === "all"
      ? cameraFeeds
      : cameraFeeds.filter((feed) => feed.zone.includes(selectedZone));

  const totalWorkers = cameraFeeds.reduce((sum, feed) => sum + feed.workers, 0);
  const activeAlerts = cameraFeeds.filter((f) => f.alerts.length > 0).length;

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-white mb-2">Live Monitoring</h2>
        <p className="text-sm text-gray-400">
          Real-time AI-powered PPE detection across all camera feeds
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Active Cameras</div>
                <div className="mt-1 text-2xl text-white">
                  {cameraFeeds.length}
                </div>
              </div>
              <Video className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Total Workers</div>
                <div className="mt-1 text-2xl text-white">{totalWorkers}</div>
              </div>
              <User className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Active Alerts</div>
                <div className="mt-1 text-2xl text-red-400">{activeAlerts}</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Detection Rate</div>
                <div className="mt-1 text-2xl text-green-400">98.5%</div>
              </div>
              <Video className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera View Tabs */}
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger
            value="single"
            className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white"
          >
            <Video className="h-4 w-4 mr-2" />
            Single Camera
          </TabsTrigger>
          <TabsTrigger
            value="multi"
            className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white"
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Multi-Camera Grid (Regional View)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-6">
          {/* Live Webcam Detection */}
          <WebcamDetection />
        </TabsContent>

        <TabsContent value="multi" className="mt-6">
          {/* Multi-Camera Grid for Regional Monitoring */}
          <MultiCameraGrid />
        </TabsContent>
      </Tabs>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm mb-2 text-gray-400">Zone Filter</div>
            <Tabs value={selectedZone} onValueChange={setSelectedZone}>
              <TabsList className="bg-gray-800">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white"
                >
                  All Zones
                </TabsTrigger>
                <TabsTrigger
                  value="Level 1"
                  className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white"
                >
                  Level 1
                </TabsTrigger>
                <TabsTrigger
                  value="Level 2"
                  className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white"
                >
                  Level 2
                </TabsTrigger>
                <TabsTrigger
                  value="Roof"
                  className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white"
                >
                  Roof
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <div className="text-sm mb-2 text-gray-400">
              PPE Detection Toggle
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedPPE.includes("helmet") ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPPE((prev) =>
                    prev.includes("helmet")
                      ? prev.filter((p) => p !== "helmet")
                      : [...prev, "helmet"]
                  );
                }}
                className={
                  selectedPPE.includes("helmet")
                    ? "bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                }
              >
                <HardHat className="h-4 w-4 mr-2" />
                Helmet
              </Button>
              <Button
                variant={selectedPPE.includes("vest") ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPPE((prev) =>
                    prev.includes("vest")
                      ? prev.filter((p) => p !== "vest")
                      : [...prev, "vest"]
                  );
                }}
                className={
                  selectedPPE.includes("vest")
                    ? "bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                }
              >
                <Shirt className="h-4 w-4 mr-2" />
                Vest
              </Button>
              <Button
                variant={
                  selectedPPE.includes("harness") ? "default" : "outline"
                }
                size="sm"
                onClick={() => {
                  setSelectedPPE((prev) =>
                    prev.includes("harness")
                      ? prev.filter((p) => p !== "harness")
                      : [...prev, "harness"]
                  );
                }}
                className={
                  selectedPPE.includes("harness")
                    ? "bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                }
              >
                Harness
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFeeds
          .filter((f) => f.id !== 9)
          .map((feed) => (
            <Card
              key={feed.id}
              className="overflow-hidden bg-gray-900 border-gray-800"
            >
              <div className="relative">
                {/* Camera Feed Placeholder */}
                <div className="aspect-video bg-black flex items-center justify-center relative">
                  <Video className="h-12 w-12 text-gray-600" />

                  {/* Status Indicator */}
                  <div className="absolute top-2 left-2">
                    <div
                      className={`
                    flex items-center gap-1 px-2 py-1 rounded text-xs
                    ${feed.status === "safe" ? "bg-green-500" : ""}
                    ${feed.status === "warning" ? "bg-yellow-500" : ""}
                    ${
                      feed.status === "danger" ? "bg-red-500 animate-pulse" : ""
                    }
                    text-white
                  `}
                    >
                      <div className="h-2 w-2 rounded-full bg-white" />
                      LIVE
                    </div>
                  </div>

                  {/* Worker Count */}
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {feed.workers}
                    </div>
                  </div>

                  {/* PPE Detection Overlays - Simulated */}
                  {feed.workers > 0 && (
                    <div className="absolute inset-0 p-4">
                      {Array.from({ length: Math.min(feed.workers, 3) }).map(
                        (_, i) => (
                          <div
                            key={i}
                            className={`
                          absolute border-2 rounded
                          ${
                            feed.alerts.length > 0 && i === 0
                              ? "border-red-500"
                              : "border-green-500"
                          }
                        `}
                            style={{
                              left: `${20 + i * 25}%`,
                              top: `${30 + i * 10}%`,
                              width: "60px",
                              height: "80px",
                            }}
                          >
                            {feed.alerts.length > 0 && i === 0 && (
                              <div className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap">
                                {feed.alerts[0]}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-4 bg-gray-900">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm text-white">{feed.zone}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {feed.workers} workers detected
                    </div>
                  </div>
                  {feed.alerts.length > 0 && (
                    <Badge
                      variant="outline"
                      className="border-red-500 text-red-400"
                    >
                      {feed.alerts.length}
                    </Badge>
                  )}
                </div>

                {feed.alerts.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-gray-800">
                    {feed.alerts.map((alert, i) => (
                      <div
                        key={i}
                        className="text-xs text-red-400 flex items-center gap-2"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {alert}
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7 border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        Notify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7 border-gray-700 text-gray-300 hover:bg-gray-800"
                        onClick={() =>
                          updateCameraFeed(feed.id, {
                            alerts: [],
                            status: "safe",
                          })
                        }
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
