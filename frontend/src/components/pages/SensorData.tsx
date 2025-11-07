import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Activity, Smartphone, MapPin, Lightbulb, Gauge, Navigation, AlertTriangle } from 'lucide-react';

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface GyroscopeData {
  x: number;
  y: number;
  z: number;
}

interface MagnetometerData {
  x: number;
  y: number;
  z: number;
}

interface GPSData {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  accuracy: number;
}

interface SensorDataEntry {
  timestamp: string;
  server_received_at: number;
  accelerometer?: AccelerometerData;
  gyroscope?: GyroscopeData;
  magnetometer?: MagnetometerData;
  gps?: GPSData;
  proximity?: number;
  ambientLight?: number;
  pressure?: number;
}

interface SensorStats {
  total_entries: number;
  sensor_coverage: {
    accelerometer: number;
    gyroscope: number;
    magnetometer: number;
    gps: number;
    light: number;
  };
  latest_timestamp?: string;
  server_uptime: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Backend API URL

export default function SensorData() {
  const [latestData, setLatestData] = useState<SensorDataEntry[]>([]);
  const [stats, setStats] = useState<SensorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  console.log('🚀 SensorData component mounted!');
  console.log('Current state:', { loading, error, latestData, stats });

  const fetchSensorData = async () => {
    try {
      console.log('🔍 Fetching sensor data...');
      setError(null);
      
      const dataUrl = `${API_URL}/api/sensor-data/latest?count=1`;
      const statsUrl = `${API_URL}/api/sensor-data/stats`;
      
      console.log('📡 Data URL:', dataUrl);
      console.log('📊 Stats URL:', statsUrl);
      
      const [dataResponse, statsResponse] = await Promise.all([
        fetch(dataUrl),
        fetch(statsUrl)
      ]);

      console.log('✅ Data Response:', dataResponse.status, dataResponse.ok);
      console.log('✅ Stats Response:', statsResponse.status, statsResponse.ok);

      if (dataResponse.ok) {
        const dataResult = await dataResponse.json();
        console.log('📦 Data received:', dataResult);
        setLatestData(dataResult.data || []);
      }

      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        console.log('📊 Stats received:', statsResult);
        setStats(statsResult);
      }

      setLoading(false);
      console.log('✨ Fetch complete!');
    } catch (error) {
      console.error('❌ Error fetching sensor data:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to backend');
      setLoading(false);
    }
  };

  const clearSensorData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sensor-data`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setLatestData([]);
        setStats(null);
        alert('Sensor data cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing sensor data:', error);
      alert('Failed to clear sensor data');
    }
  };

  useEffect(() => {
    fetchSensorData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchSensorData, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const latest = latestData[0];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const calculateMagnitude = (data?: { x: number; y: number; z: number }) => {
    if (!data) return 0;
    return Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <p>Loading sensor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-2xl p-6">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 mb-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Connection Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="text-left bg-muted p-4 rounded text-sm">
              <p className="font-semibold mb-2">Troubleshooting:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Make sure the backend server is running</li>
                <li>Check that it's accessible at: <code className="bg-background px-2 py-1 rounded">{API_URL}</code></li>
                <li>Run: <code className="bg-background px-2 py-1 rounded">cd backend && uvicorn app:app --host 0.0.0.0 --port 8000 --reload</code></li>
                <li>Test endpoint: <code className="bg-background px-2 py-1 rounded">curl {API_URL}/stats</code></li>
              </ol>
            </div>
          </div>
          <Button onClick={() => { setError(null); setLoading(true); fetchSensorData(); }}>
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smartphone className="w-8 h-8" />
            Mobile Sensor Data
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time sensor data from connected mobile devices
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
          <Button variant="outline" onClick={fetchSensorData}>
            Refresh Now
          </Button>
          <Button variant="destructive" onClick={clearSensorData}>
            Clear History
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-3xl font-bold">{stats.total_entries}</p>
              </div>
              <Activity className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accelerometer</p>
                <p className="text-3xl font-bold">{stats.sensor_coverage.accelerometer}</p>
              </div>
              <Gauge className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GPS Readings</p>
                <p className="text-3xl font-bold">{stats.sensor_coverage.gps}</p>
              </div>
              <MapPin className="w-12 h-12 text-red-500 opacity-50" />
            </div>
          </Card>
        </div>
      )}

      {/* Latest Sensor Reading */}
      {latest ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Latest Reading</h2>
            <Badge variant="outline">
              {formatTimestamp(latest.timestamp)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Accelerometer */}
            {latest.accelerometer && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">Accelerometer</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">X-axis:</span>
                    <span className="font-mono">{latest.accelerometer.x.toFixed(3)} m/s²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Y-axis:</span>
                    <span className="font-mono">{latest.accelerometer.y.toFixed(3)} m/s²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Z-axis:</span>
                    <span className="font-mono">{latest.accelerometer.z.toFixed(3)} m/s²</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Magnitude:</span>
                    <span className="font-mono font-bold">
                      {calculateMagnitude(latest.accelerometer).toFixed(3)} m/s²
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Gyroscope */}
            {latest.gyroscope && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="w-6 h-6 text-purple-500" />
                  <h3 className="text-xl font-semibold">Gyroscope</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">X-axis:</span>
                    <span className="font-mono">{latest.gyroscope.x.toFixed(3)} rad/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Y-axis:</span>
                    <span className="font-mono">{latest.gyroscope.y.toFixed(3)} rad/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Z-axis:</span>
                    <span className="font-mono">{latest.gyroscope.z.toFixed(3)} rad/s</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Magnitude:</span>
                    <span className="font-mono font-bold">
                      {calculateMagnitude(latest.gyroscope).toFixed(3)} rad/s
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* GPS */}
            {latest.gps && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-semibold">GPS Location</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="font-mono">{latest.gps.latitude.toFixed(6)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longitude:</span>
                    <span className="font-mono">{latest.gps.longitude.toFixed(6)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Altitude:</span>
                    <span className="font-mono">{latest.gps.altitude.toFixed(1)} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Speed:</span>
                    <span className="font-mono">{latest.gps.speed.toFixed(1)} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="font-mono">{latest.gps.accuracy.toFixed(1)} m</span>
                  </div>
                </div>
                <div className="mt-4">
                  <a
                    href={`https://www.google.com/maps?q=${latest.gps.latitude},${latest.gps.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </Card>
            )}

            {/* Ambient Light */}
            {latest.ambientLight !== undefined && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-semibold">Ambient Light</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brightness:</span>
                    <span className="font-mono text-2xl font-bold">
                      {latest.ambientLight?.toFixed(1) || 'N/A'} lux
                    </span>
                  </div>
                  <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gray-800 via-yellow-300 to-yellow-500"
                      style={{
                        width: `${Math.min(((latest.ambientLight || 0) / 1000) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Magnetometer */}
            {latest.magnetometer && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-semibold">Magnetometer</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">X-axis:</span>
                    <span className="font-mono">{latest.magnetometer.x.toFixed(3)} µT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Y-axis:</span>
                    <span className="font-mono">{latest.magnetometer.y.toFixed(3)} µT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Z-axis:</span>
                    <span className="font-mono">{latest.magnetometer.z.toFixed(3)} µT</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Magnitude:</span>
                    <span className="font-mono font-bold">
                      {calculateMagnitude(latest.magnetometer).toFixed(3)} µT
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Pressure */}
            {latest.pressure !== undefined && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Gauge className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-xl font-semibold">Atmospheric Pressure</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pressure:</span>
                    <span className="font-mono text-2xl font-bold">
                      {latest.pressure?.toFixed(2) || 'N/A'} hPa
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Sensor Data Yet</h3>
          <p className="text-muted-foreground mb-4">
            Waiting for mobile devices to send sensor data...
          </p>
          <div className="text-sm text-left max-w-2xl mx-auto bg-muted p-4 rounded-lg">
            <p className="font-semibold mb-2">To connect your phone:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open the Flutter sensor app on your phone</li>
              <li>Update the server URL to: <code className="bg-background px-2 py-1 rounded">{API_URL}/api/sensor-data</code></li>
              <li>Tap "Start Streaming" to begin sending data</li>
            </ol>
          </div>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Mobile App Configuration
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Server URL:</strong>{' '}
            <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">
              {API_URL}/api/sensor-data
            </code>
          </p>
          <p className="text-muted-foreground">
            Configure this URL in your Flutter sensor app to send data to this dashboard.
          </p>
        </div>
      </Card>
    </div>
  );
}
