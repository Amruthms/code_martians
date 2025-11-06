import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  MapPin, 
  AlertTriangle, 
  Users, 
  Thermometer, 
  Wind,
  Activity,
  Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Progress } from './ui/progress';

export function DigitalTwinMap() {
  const { zones, alerts, cameraFeeds } = useApp();
  const [selectedZone, setSelectedZone] = useState<typeof zones[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getZoneColor = (status: string, riskLevel?: string) => {
    if (status === 'danger') return '#EF4444';
    if (status === 'restricted') return '#F59E0B';
    if (riskLevel === 'high') return '#F59E0B';
    if (riskLevel === 'medium') return '#3B82F6';
    return '#22C55E';
  };

  const handleZoneClick = (zone: typeof zones[0]) => {
    setSelectedZone(zone);
    setDialogOpen(true);
  };

  const getZoneAlerts = (zoneName: string) => {
    return alerts.filter(a => a.zone === zoneName && a.status === 'pending');
  };

  return (
    <>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-400" />
            Digital Twin - Site Map
          </CardTitle>
          <CardDescription className="text-gray-400">
            Real-time 2D visualization of all construction zones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full bg-gray-950 rounded-lg p-4 border border-gray-800" style={{ height: '500px' }}>
            {/* Map Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-gray-900 p-3 rounded-lg border border-gray-700 z-10">
              <div className="text-xs text-gray-300 mb-2">Risk Level</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Safe</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-400">Medium</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-400">High</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-400">Danger</span>
                </div>
              </div>
            </div>

            {/* Zones */}
            <div className="relative w-full h-full">
              {zones.map((zone) => {
                const zoneAlerts = getZoneAlerts(zone.name);
                const color = getZoneColor(zone.status, zone.riskForecast?.riskLevel);

                return (
                  <div
                    key={zone.id}
                    onClick={() => handleZoneClick(zone)}
                    className="absolute cursor-pointer transition-all hover:scale-105 hover:z-20 group"
                    style={{
                      left: `${zone.position.x}%`,
                      top: `${zone.position.y}%`,
                      width: `${zone.position.width}%`,
                      height: `${zone.position.height}%`,
                    }}
                  >
                    {/* Zone Rectangle */}
                    <div
                      className="w-full h-full rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all"
                      style={{
                        backgroundColor: `${color}15`,
                        borderColor: color,
                        boxShadow: `0 0 20px ${color}40`,
                      }}
                    >
                      {/* Zone Label */}
                      <div className="text-white text-xs mb-1 text-center">
                        {zone.name}
                      </div>

                      {/* Worker Count */}
                      <div className="flex items-center gap-1 text-xs text-gray-300">
                        <Users className="h-3 w-3" />
                        <span>{zone.workers}</span>
                      </div>

                      {/* Risk Badge */}
                      <Badge
                        className="mt-1 text-xs border-0"
                        style={{
                          backgroundColor: `${color}30`,
                          color: color,
                        }}
                      >
                        Risk: {zone.riskIndex}%
                      </Badge>

                      {/* Alert Indicator */}
                      {zoneAlerts.length > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs animate-pulse">
                          {zoneAlerts.length}
                        </div>
                      )}
                    </div>

                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-30">
                      <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white whitespace-nowrap shadow-xl">
                        <div className="mb-1">
                          {zone.riskForecast?.riskLevel.toUpperCase()} RISK
                        </div>
                        <div className="text-gray-400">Click for details</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zone Statistics */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl text-green-400">{zones.filter(z => z.status === 'safe').length}</div>
              <div className="text-xs text-gray-400">Safe Zones</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl text-yellow-400">{zones.filter(z => z.status === 'restricted').length}</div>
              <div className="text-xs text-gray-400">Restricted</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl text-red-400">{zones.filter(z => z.status === 'danger').length}</div>
              <div className="text-xs text-gray-400">Danger</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl text-white">{zones.reduce((sum, z) => sum + z.workers, 0)}</div>
              <div className="text-xs text-gray-400">Total Workers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          {selectedZone && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  {selectedZone.name} - Zone Details
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Comprehensive zone monitoring and risk assessment
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-300">Zone Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        className="border-0"
                        style={{
                          backgroundColor: `${getZoneColor(selectedZone.status)}30`,
                          color: getZoneColor(selectedZone.status),
                        }}
                      >
                        {selectedZone.status.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-300">Active Workers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span className="text-xl text-white">{selectedZone.workers}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Environmental Conditions */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-300">Environmental Conditions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-400" />
                      <div>
                        <div className="text-xs text-gray-400">Temperature</div>
                        <div className="text-white">{selectedZone.temp}°C</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-blue-400" />
                      <div>
                        <div className="text-xs text-gray-400">Noise</div>
                        <div className="text-white">{selectedZone.noise} dB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-400" />
                      <div>
                        <div className="text-xs text-gray-400">Dust</div>
                        <div className="text-white">{selectedZone.dust} μg/m³</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Forecast */}
                {selectedZone.riskForecast && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        24-Hour Risk Forecast
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Risk Probability</span>
                          <span className="text-white">{selectedZone.riskForecast.probability}%</span>
                        </div>
                        <Progress value={selectedZone.riskForecast.probability} className="h-2" />
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-2">Risk Factors:</div>
                        <div className="space-y-1">
                          {selectedZone.riskForecast.factors.map((factor, idx) => (
                            <div key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5"></div>
                              {factor}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-2">Recommendations:</div>
                        <div className="space-y-1">
                          {selectedZone.riskForecast.recommendations.map((rec, idx) => (
                            <div key={idx} className="text-xs text-green-300 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5"></div>
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Near Misses */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-300">Near-Miss Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-white">{selectedZone.nearMissCount || 0}</div>
                    <div className="text-xs text-gray-400 mt-1">Incidents this week</div>
                  </CardContent>
                </Card>

                {/* Active Alerts */}
                {getZoneAlerts(selectedZone.name).length > 0 && (
                  <Card className="bg-red-900/20 border-red-800">
                    <CardHeader>
                      <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Active Alerts ({getZoneAlerts(selectedZone.name).length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {getZoneAlerts(selectedZone.name).map((alert) => (
                        <div key={alert.id} className="p-2 bg-gray-900 rounded text-xs">
                          <div className="text-white">{alert.type}</div>
                          <div className="text-gray-400">{alert.worker} - {alert.time}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Camera Feed Reference */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                      <Camera className="h-4 w-4 text-blue-400" />
                      Camera Feeds
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-400">
                      {cameraFeeds.filter(f => f.zone === selectedZone.name).length} camera(s) monitoring this zone
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
