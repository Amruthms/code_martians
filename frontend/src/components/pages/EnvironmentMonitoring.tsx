import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wind, Volume2, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';

const dustData = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 38 },
  { time: '08:00', value: 65 },
  { time: '12:00', value: 82 },
  { time: '16:00', value: 58 },
  { time: '20:00', value: 42 },
];

const noiseData = [
  { time: '00:00', value: 55 },
  { time: '04:00', value: 52 },
  { time: '08:00', value: 78 },
  { time: '12:00', value: 85 },
  { time: '16:00', value: 72 },
  { time: '20:00', value: 58 },
];

const sensors = [
  { id: 1, zone: 'Level 1 - East', dust: 45, noise: 72, temp: 18, humidity: 62, status: 'normal' },
  { id: 2, zone: 'Level 1 - West', dust: 120, noise: 85, temp: 22, humidity: 58, status: 'warning' },
  { id: 3, zone: 'Level 2 - North', dust: 62, noise: 68, temp: 16, humidity: 65, status: 'normal' },
  { id: 4, zone: 'Roof - West', dust: 35, noise: 65, temp: 12, humidity: 70, status: 'normal' },
];

export function EnvironmentMonitoring() {
  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-white mb-2">Environment Monitoring</h2>
        <p className="text-sm text-gray-400">Real-time environmental conditions across all zones</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Avg Dust Level</div>
                <div className="mt-1 text-2xl text-white">65 μg/m³</div>
                <Badge variant="outline" className="mt-2 border-yellow-500 text-yellow-400">Moderate</Badge>
              </div>
              <Wind className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Avg Noise</div>
                <div className="mt-1 text-2xl text-white">72 dB</div>
                <Badge variant="outline" className="mt-2 border-green-500 text-green-400">Safe</Badge>
              </div>
              <Volume2 className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Avg Temperature</div>
                <div className="mt-1 text-2xl text-white">17°C</div>
                <Badge variant="outline" className="mt-2 border-green-500 text-green-400">Comfortable</Badge>
              </div>
              <Thermometer className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Humidity</div>
                <div className="mt-1 text-2xl text-white">64%</div>
                <Badge variant="outline" className="mt-2 border-green-500 text-green-400">Normal</Badge>
              </div>
              <Droplets className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Dust Level Trend (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dustData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="value" stroke="#FF7A00" strokeWidth={2} dot={{ fill: '#FF7A00' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Noise Level Trend (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={noiseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="value" stroke="#3A4E7A" strokeWidth={2} dot={{ fill: '#3A4E7A' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Details */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Zone Sensors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sensors.map((sensor) => (
              <div key={sensor.id} className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white">{sensor.zone}</h3>
                  <Badge
                    variant="outline"
                    className={sensor.status === 'normal' ? 'border-green-500 text-green-400' : 'border-yellow-500 text-yellow-400'}
                  >
                    {sensor.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-400">Dust</span>
                    </div>
                    <div className="text-white">{sensor.dust} μg/m³</div>
                    <Progress value={(sensor.dust / 150) * 100} className="h-1.5 mt-2 bg-gray-700" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-400">Noise</span>
                    </div>
                    <div className="text-white">{sensor.noise} dB</div>
                    <Progress value={(sensor.noise / 100) * 100} className="h-1.5 mt-2 bg-gray-700" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-400">Temp</span>
                    </div>
                    <div className="text-white">{sensor.temp}°C</div>
                    <Progress value={(sensor.temp / 40) * 100} className="h-1.5 mt-2 bg-gray-700" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-400">Humidity</span>
                    </div>
                    <div className="text-white">{sensor.humidity}%</div>
                    <Progress value={sensor.humidity} className="h-1.5 mt-2 bg-gray-700" />
                  </div>
                </div>

                {sensor.status === 'warning' && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-yellow-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>High dust and noise levels detected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
