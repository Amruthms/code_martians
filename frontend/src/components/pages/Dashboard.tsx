import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  HardHat, 
  Shirt, 
  AlertTriangle, 
  TrendingUp, 
  Wind,
  Phone,
  FileText,
  CheckCircle2,
  Brain,
  CloudRain,
  Mic,
  Trophy,
  Map,
  Sparkles
} from 'lucide-react';
import { Progress } from '../ui/progress';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';
import { EmergencyEvacuation } from '../EmergencyEvacuation';
import { toast } from 'sonner@2.0.3';
import { generateSafetyReport } from '../../services/pdfGenerator';

const ppeData = [
  { name: 'Helmet', value: 94, icon: HardHat, color: '#22C55E' },
  { name: 'Vest', value: 89, icon: Shirt, color: '#FF7A00' },
  { name: 'Gloves', value: 76, icon: HardHat, color: '#EAB308' },
  { name: 'Harness', value: 68, icon: HardHat, color: '#3A4E7A' },
];

const incidentData = [
  { zone: 'Level 1', incidents: 2 },
  { zone: 'Level 2', incidents: 5 },
  { zone: 'Roof', incidents: 1 },
  { zone: 'Ground', incidents: 3 },
];

const trendData = [
  { day: 'Mon', compliance: 85 },
  { day: 'Tue', compliance: 88 },
  { day: 'Wed', compliance: 92 },
  { day: 'Thu', compliance: 89 },
  { day: 'Fri', compliance: 94 },
  { day: 'Sat', compliance: 91 },
  { day: 'Sun', compliance: 87 },
];

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps = {}) {
  const { alerts, cameraFeeds, updateAlertStatus, weatherData, zones, workers } = useApp();
  
  const pendingAlerts = alerts.filter(a => a.status === 'pending').length;
  const recentAlerts = alerts.slice(0, 3);
  const highRiskZones = zones.filter(z => z.riskForecast && z.riskForecast.riskLevel === 'high');

  const handleAcknowledgeAlert = () => {
    const firstPendingAlert = alerts.find(a => a.status === 'pending');
    if (firstPendingAlert) {
      updateAlertStatus(firstPendingAlert.id, 'acknowledged');
      toast.success('Alert Acknowledged', {
        description: `${firstPendingAlert.type} in ${firstPendingAlert.zone}`,
      });
    }
  };

  const generateQuickReport = () => {
    try {
      const doc = generateSafetyReport(
        'Quick Safety Report',
        new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        'Quick Report',
        {
          alerts,
          workers,
          zones,
        }
      );
      
      doc.save(`Quick_Report_${Date.now()}.pdf`);
      
      toast.success('Report Generated', {
        description: 'Quick safety report has been downloaded',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Generation Failed', {
        description: 'Unable to generate report',
      });
    }
  };

  const handleEmergencyCall = () => {
    toast.error('Emergency Alert Activated', {
      description: 'Emergency services have been notified. Help is on the way.',
      duration: 10000,
    });
    
    // In a real system, this would trigger actual emergency protocols
    console.log('EMERGENCY CALL INITIATED - All supervisors and emergency services alerted');
  };

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl text-white mb-2">Current Site Status</h2>
        <p className="text-sm text-gray-400">Real-time overview of Oslo Central Construction Site</p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">PPE Compliance</CardTitle>
            <HardHat className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">92%</div>
            <Progress value={92} className="h-2 bg-gray-800" />
            <p className="text-xs text-gray-400 mt-2">
              <span className="text-green-400">+4%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">{pendingAlerts}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="border-red-500 text-red-400 text-xs">
                {alerts.filter(a => a.severity === 'critical').length} Critical
              </Badge>
              <Badge variant="outline" className="border-yellow-500 text-yellow-400 text-xs">
                {alerts.filter(a => a.severity === 'high').length} High
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Environmental Score</CardTitle>
            <Wind className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">Good</div>
            <div className="flex gap-2 text-xs text-gray-400 mt-2">
              <span>Dust: Low</span>
              <span>Noise: 78dB</span>
              <span>Temp: 18°C</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Zone Risk Index</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">Low</div>
            <div className="mt-2">
              <Badge className="bg-green-900/50 text-green-400 border-0">Safe Operations</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Charts and Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* PPE Compliance Details */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">PPE Compliance by Type</CardTitle>
              <CardDescription className="text-gray-400">Current compliance rates across all workers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ppeData.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="flex items-center gap-4">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1 text-gray-300">
                          <span>{item.name}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ width: `${item.value}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Incidents Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Incidents Per Zone (This Week)</CardTitle>
              <CardDescription className="text-gray-400">Total alerts and incidents by location</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={incidentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="zone" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar dataKey="incidents" fill="#FF7A00" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Compliance Trend */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">7-Day Compliance Trend</CardTitle>
              <CardDescription className="text-gray-400">Overall PPE compliance rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Line type="monotone" dataKey="compliance" stroke="#3A4E7A" strokeWidth={2} dot={{ fill: '#3A4E7A' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Live Cameras and Alerts */}
        <div className="space-y-6">
          {/* Emergency Response */}
          <EmergencyEvacuation />

          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start text-white" 
                style={{ backgroundColor: '#FF7A00' }}
                disabled={pendingAlerts === 0}
                onClick={handleAcknowledgeAlert}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Acknowledge Alert
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={generateQuickReport}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-red-700 text-red-400 hover:bg-red-950/20"
                onClick={handleEmergencyCall}
              >
                <Phone className="h-4 w-4 mr-2" />
                Emergency Call
              </Button>
            </CardContent>
          </Card>

          {/* Live Camera Feeds */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Live Camera Feeds</CardTitle>
              <CardDescription className="text-gray-400">AI-powered PPE detection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {cameraFeeds.slice(0, 4).map((feed) => (
                <div 
                  key={feed.id}
                  className={`
                    relative rounded-lg overflow-hidden border-2 aspect-video
                    ${feed.status === 'safe' ? 'border-green-500' : ''}
                    ${feed.status === 'warning' ? 'border-yellow-500' : ''}
                    ${feed.status === 'danger' ? 'border-red-500' : ''}
                  `}
                >
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <div className="text-center text-white text-sm">
                      <div className="mb-1">{feed.zone}</div>
                      <div className="text-xs text-gray-400">{feed.workers} workers</div>
                    </div>
                  </div>
                  {feed.status === 'safe' && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        Safe
                      </div>
                    </div>
                  )}
                  {feed.status === 'warning' && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        Warning
                      </div>
                    </div>
                  )}
                  {feed.status === 'danger' && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs animate-pulse">
                        <AlertTriangle className="h-3 w-3" />
                        Alert
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <div className="text-sm text-white">{alert.type}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {alert.zone} • {alert.time}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      alert.status === 'resolved' ? 'border-green-500 text-green-400' :
                      alert.status === 'acknowledged' ? 'border-yellow-500 text-yellow-400' :
                      'border-red-500 text-red-400'
                    }
                  >
                    {alert.status}
                  </Badge>
                </div>
              ))}
              {recentAlerts.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No recent alerts
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Features Preview */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-gray-900 border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Advanced Intelligence Features
              </CardTitle>
              <CardDescription className="text-gray-400">
                AI-powered safety predictions, automation & gamification
              </CardDescription>
            </div>
            {onNavigate && (
              <Button
                onClick={() => onNavigate('advanced')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Brain className="h-4 w-4 mr-2" />
                Explore All Features
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* AI Risk Forecast */}
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer" onClick={() => onNavigate?.('advanced')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-sm text-white">AI Risk Forecast</div>
              </div>
              <div className="text-xs text-gray-400 mb-2">Tomorrow's Risk Index</div>
              {highRiskZones.length > 0 ? (
                <Badge className="bg-red-900/50 text-red-400 border-0 text-xs">
                  {highRiskZones.length} High Risk Zone{highRiskZones.length > 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge className="bg-green-900/50 text-green-400 border-0 text-xs">
                  Low Risk Tomorrow
                </Badge>
              )}
            </div>

            {/* Weather Automation */}
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer" onClick={() => onNavigate?.('advanced')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center">
                  <CloudRain className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-sm text-white">Weather Safety</div>
              </div>
              <div className="text-xs text-gray-400 mb-2">Live Conditions</div>
              {weatherData && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{weatherData.icon}</span>
                  <span className="text-white text-sm">{weatherData.temperature}°C</span>
                  {weatherData.alerts.length > 0 && (
                    <Badge className="bg-orange-900/50 text-orange-400 border-0 text-xs">
                      {weatherData.alerts.length} Alert{weatherData.alerts.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Voice Assistant */}
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer" onClick={() => onNavigate?.('advanced')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center">
                  <Mic className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-sm text-white">SafeBot Assistant</div>
              </div>
              <div className="text-xs text-gray-400 mb-2">Voice Commands</div>
              <Badge className="bg-green-900/50 text-green-400 border-0 text-xs">
                Hands-Free Control
              </Badge>
            </div>

            {/* Digital Twin Map */}
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer" onClick={() => onNavigate?.('advanced')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-900/50 flex items-center justify-center">
                  <Map className="h-5 w-5 text-orange-400" />
                </div>
                <div className="text-sm text-white">Digital Twin Map</div>
              </div>
              <div className="text-xs text-gray-400 mb-2">Interactive Site View</div>
              <Badge className="bg-orange-900/50 text-orange-400 border-0 text-xs">
                Real-Time Zones
              </Badge>
            </div>
          </div>

          {/* Additional Features List */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <Trophy className="h-3 w-3 text-yellow-400" />
                <span>Safety Gamification</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <AlertTriangle className="h-3 w-3 text-yellow-400" />
                <span>Near-Miss Detection</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <FileText className="h-3 w-3 text-blue-400" />
                <span>AI-Generated Reports</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span>Safety Index Trends</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
