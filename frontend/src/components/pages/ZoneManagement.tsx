import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  MapPin, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Wind,
  Volume2,
  Thermometer,
  Activity
} from 'lucide-react';
import { Progress } from '../ui/progress';
import { useApp } from '../../context/AppContext';

export function ZoneManagement() {
  const { zones } = useApp();
  const [selectedZone, setSelectedZone] = useState(zones[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500';
      case 'restricted': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'safe': return 'border-green-500 text-green-400';
      case 'restricted': return 'border-yellow-500 text-yellow-400';
      case 'danger': return 'border-red-500 text-red-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-white mb-2">Zone Management</h2>
        <p className="text-sm text-gray-400">Monitor zones, sensors, and environmental conditions</p>
      </div>

      {/* Zone Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Total Zones</div>
                <div className="mt-1 text-2xl text-white">{zones.length}</div>
              </div>
              <MapPin className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Safe Zones</div>
                <div className="mt-1 text-2xl text-green-400">
                  {zones.filter(z => z.status === 'safe').length}
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">High Risk</div>
                <div className="mt-1 text-2xl text-red-400">
                  {zones.filter(z => z.status === 'danger').length}
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Active Workers</div>
                <div className="mt-1 text-2xl text-white">
                  {zones.reduce((sum, z) => sum + z.workers, 0)}
                </div>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Zone Map */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Site Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] bg-gray-800 rounded-lg relative overflow-hidden">
                {/* Site Map Background */}
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid */}
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                  
                  {/* Zones */}
                  {zones.map((zone) => (
                    <g key={zone.id}>
                      <rect
                        x={zone.position.x}
                        y={zone.position.y}
                        width={zone.position.width}
                        height={zone.position.height}
                        fill={zone.status === 'safe' ? '#22C55E20' : zone.status === 'restricted' ? '#EAB30820' : '#EF444420'}
                        stroke={zone.status === 'safe' ? '#22C55E' : zone.status === 'restricted' ? '#EAB308' : '#EF4444'}
                        strokeWidth="0.5"
                        className="cursor-pointer transition-all hover:opacity-80"
                        onClick={() => setSelectedZone(zone)}
                      />
                      <text
                        x={zone.position.x + zone.position.width / 2}
                        y={zone.position.y + zone.position.height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[3px] fill-white pointer-events-none"
                        fontSize="3"
                      >
                        {zone.name}
                      </text>
                      <circle
                        cx={zone.position.x + zone.position.width / 2}
                        cy={zone.position.y + zone.position.height / 2 + 4}
                        r="2"
                        fill={zone.status === 'safe' ? '#22C55E' : zone.status === 'restricted' ? '#EAB308' : '#EF4444'}
                        className="animate-pulse"
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-green-500"></div>
                  <span className="text-gray-400">Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-yellow-500"></div>
                  <span className="text-gray-400">Restricted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-red-500"></div>
                  <span className="text-gray-400">Danger</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zones List */}
          <Card className="bg-gray-900 border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-white">All Zones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${selectedZone.id === zone.id 
                      ? 'bg-[#FF7A00] text-white' 
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                    }
                  `}
                >
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(zone.status)}`}></div>
                  <div className="flex-1 text-left">
                    <div className="text-sm">{zone.name}</div>
                    <div className={`text-xs ${selectedZone.id === zone.id ? 'text-white/70' : 'text-gray-500'}`}>
                      {zone.workers} workers • Risk: {zone.riskIndex}
                    </div>
                  </div>
                  <Badge variant="outline" className={selectedZone.id === zone.id ? 'border-white text-white' : getStatusBadgeColor(zone.status)}>
                    {zone.status}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Zone Details */}
        <div className="space-y-6">
          {selectedZone && (
            <>
              {/* Selected Zone Info */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{selectedZone.name}</CardTitle>
                    <Badge variant="outline" className={getStatusBadgeColor(selectedZone.status)}>
                      {selectedZone.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Workers</span>
                    </div>
                    <span className="text-white">{selectedZone.workers}</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Risk Index</span>
                      </div>
                      <span className="text-white">{selectedZone.riskIndex}</span>
                    </div>
                    <Progress value={selectedZone.riskIndex} className="h-2 bg-gray-800" />
                  </div>
                </CardContent>
              </Card>

              {/* Environmental Sensors */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Environmental Sensors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Dust Level</span>
                      </div>
                      <span className="text-white">{selectedZone.dust} μg/m³</span>
                    </div>
                    <Progress value={(selectedZone.dust / 150) * 100} className="h-2 bg-gray-800" />
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedZone.dust < 50 ? 'Low' : selectedZone.dust < 100 ? 'Moderate' : 'High'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Volume2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Noise Level</span>
                      </div>
                      <span className="text-white">{selectedZone.noise} dB</span>
                    </div>
                    <Progress value={(selectedZone.noise / 100) * 100} className="h-2 bg-gray-800" />
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedZone.noise < 70 ? 'Safe' : selectedZone.noise < 85 ? 'Caution' : 'Ear Protection Required'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Thermometer className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Temperature</span>
                      </div>
                      <span className="text-white">{selectedZone.temp}°C</span>
                    </div>
                    <Progress value={(selectedZone.temp / 40) * 100} className="h-2 bg-gray-800" />
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedZone.temp < 15 ? 'Cold' : selectedZone.temp < 25 ? 'Comfortable' : 'Warm'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Zone Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send Zone Alert
                  </Button>
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                    <Activity className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                    <MapPin className="h-4 w-4 mr-2" />
                    Edit Zone
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
