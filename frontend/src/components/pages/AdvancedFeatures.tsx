import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Brain,
  CloudRain,
  Mic,
  Trophy,
  AlertTriangle,
  Wifi,
  WifiOff,
  Map,
  Languages,
  FileText,
  TrendingUp,
  Award,
  Target,
  Users,
  Zap,
  Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VoiceAssistant } from '../VoiceAssistant';
import { DigitalTwinMap } from '../DigitalTwinMap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdvancedFeatures() {
  const { 
    zones, 
    alerts, 
    workers, 
    nearMisses, 
    weatherData, 
    offlineMode, 
    setOfflineMode,
    awardPoints 
  } = useApp();

  // Leaderboard sorted by gamification points
  const leaderboard = [...workers]
    .filter(w => w.gamificationPoints)
    .sort((a, b) => (b.gamificationPoints || 0) - (a.gamificationPoints || 0))
    .slice(0, 10);

  // Near-miss heatmap data
  const nearMissHeatmap = zones.map(z => ({
    zone: z.name.split(' ')[0] + ' ' + z.name.split(' ')[1],
    count: z.nearMissCount || 0,
  }));

  // Safety score trend (mock data)
  const safetyTrend = [
    { week: 'W40', score: 85 },
    { week: 'W41', score: 88 },
    { week: 'W42', score: 90 },
    { week: 'W43', score: 89 },
    { week: 'W44', score: 92 },
    { week: 'W45', score: 94 },
  ];

  const translateAlert = (text: string, language: string): string => {
    // Simulated translation - in production, would use translation API
    const translations: Record<string, Record<string, string>> = {
      'Helmet Missing': {
        sv: 'Hjälm saknas',
        da: 'Hjelm mangler',
        no: 'Hjelm mangler',
        fi: 'Kypärä puuttuu',
      },
      'Safety Vest Required': {
        sv: 'Säkerhetsväst krävs',
        da: 'Sikkerhedsvest påkrævet',
        no: 'Sikkerhetsve st påkrevd',
        fi: 'Turvaliivi vaaditaan',
      },
    };

    return translations[text]?.[language] || text;
  };

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white mb-2">Advanced Intelligence Features</h2>
          <p className="text-sm text-gray-400">
            AI-powered safety analytics, predictions, and automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setOfflineMode(!offlineMode)}
            className={
              offlineMode
                ? 'border-orange-600 text-orange-400 hover:bg-orange-950/20'
                : 'border-green-600 text-green-400 hover:bg-green-950/20'
            }
          >
            {offlineMode ? (
              <>
                <WifiOff className="h-4 w-4 mr-2" />
                Offline Mode
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Online
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Offline Mode Banner */}
      {offlineMode && (
        <Card className="bg-orange-900/20 border-orange-700">
          <CardContent className="p-4 flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-orange-400" />
            <div className="flex-1">
              <div className="text-sm text-orange-400">Edge Node Mode Active</div>
              <div className="text-xs text-orange-300">Recording locally - Will sync when connection restored</div>
            </div>
            <Badge className="bg-orange-900/50 text-orange-300 border-0">
              📶 Recording Locally
            </Badge>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="ai-forecast" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="ai-forecast" className="data-[state=active]:bg-gray-800">
            <Brain className="h-4 w-4 mr-2" />
            AI Forecast
          </TabsTrigger>
          <TabsTrigger value="weather" className="data-[state=active]:bg-gray-800">
            <CloudRain className="h-4 w-4 mr-2" />
            Weather Automation
          </TabsTrigger>
          <TabsTrigger value="voice" className="data-[state=active]:bg-gray-800">
            <Mic className="h-4 w-4 mr-2" />
            Voice Assistant
          </TabsTrigger>
          <TabsTrigger value="gamification" className="data-[state=active]:bg-gray-800">
            <Trophy className="h-4 w-4 mr-2" />
            Gamification
          </TabsTrigger>
          <TabsTrigger value="near-miss" className="data-[state=active]:bg-gray-800">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Near-Miss
          </TabsTrigger>
          <TabsTrigger value="digital-twin" className="data-[state=active]:bg-gray-800">
            <Map className="h-4 w-4 mr-2" />
            Digital Twin
          </TabsTrigger>
        </TabsList>

        {/* AI-Driven Risk Forecast */}
        <TabsContent value="ai-forecast" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Tomorrow's Risk Index */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Tomorrow's Risk Index (24-Hour Forecast)
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-predicted accident likelihood per zone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {zones.map((zone) => {
                  const forecast = zone.riskForecast;
                  if (!forecast) return null;

                  return (
                    <div key={zone.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-white">{zone.name}</div>
                          <div className="text-xs text-gray-400">
                            {forecast.riskLevel.toUpperCase()} RISK
                          </div>
                        </div>
                        <Badge
                          className="border-0"
                          style={{
                            backgroundColor:
                              forecast.riskLevel === 'high'
                                ? '#DC262620'
                                : forecast.riskLevel === 'medium'
                                ? '#F59E0B20'
                                : '#22C55E20',
                            color:
                              forecast.riskLevel === 'high'
                                ? '#EF4444'
                                : forecast.riskLevel === 'medium'
                                ? '#F59E0B'
                                : '#22C55E',
                          }}
                        >
                          {forecast.probability}% Risk
                        </Badge>
                      </div>
                      <Progress value={forecast.probability} className="h-2" />
                      <div className="text-xs text-gray-400">
                        Factors: {forecast.factors.join(', ')}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI-Generated Incident Reports */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  AI-Generated Incident Reports
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Auto-generated summaries when alerts resolve
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts
                  .filter((a) => a.aiGeneratedReport)
                  .slice(0, 3)
                  .map((alert) => (
                    <div key={alert.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm text-white">{alert.type}</div>
                        <Badge className="bg-green-900/50 text-green-400 border-0 text-xs">
                          Resolved
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        {alert.zone} • {alert.date}
                      </div>
                      <div className="text-xs text-gray-300 p-2 bg-gray-900 rounded">
                        {alert.aiGeneratedReport}
                      </div>
                    </div>
                  ))}
                {alerts.filter((a) => a.aiGeneratedReport).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Reports will appear here when alerts are resolved
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Safety Index Dashboard */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Safety Index Trend
              </CardTitle>
              <CardDescription className="text-gray-400">
                Composite KPI: PPE compliance + incident frequency + response time + environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={safetyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{ fill: '#22C55E', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weather-Aware Safety Automation */}
        <TabsContent value="weather" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-blue-400" />
                  Real-Time Weather Monitoring
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Nordic weather-aware safety automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weatherData && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-4xl mb-2">{weatherData.icon}</div>
                        <div className="text-xl text-white">{weatherData.condition}</div>
                        <div className="text-sm text-gray-400">Oslo Construction Site</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl text-white">{weatherData.temperature}°C</div>
                        <div className="text-sm text-gray-400">Feels like {weatherData.temperature - 2}°C</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                      <div>
                        <div className="text-xs text-gray-400">Wind Speed</div>
                        <div className="text-lg text-white">{weatherData.windSpeed} km/h</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Humidity</div>
                        <div className="text-lg text-white">{weatherData.humidity}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-orange-900/20 border-orange-700">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Weather-Triggered Alerts
                </CardTitle>
                <CardDescription className="text-orange-300">
                  Automated safety responses to weather conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {weatherData?.alerts.map((alert, idx) => (
                  <div key={idx} className="p-3 bg-orange-900/30 rounded-lg border border-orange-700">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-orange-200">{alert}</div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-400 mb-2">Automated Actions:</div>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div>✓ Crane operations paused automatically</div>
                    <div>✓ Workers notified via app</div>
                    <div>✓ Roof zone access restricted</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Weather-Based Safety Rules</CardTitle>
              <CardDescription className="text-gray-400">
                Conditional automation based on Nordic weather patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="text-sm text-white">High Wind ({'>'}50 km/h)</div>
                    <div className="text-xs text-gray-400">Crane operations auto-paused</div>
                  </div>
                  <Badge className="bg-green-900/50 text-green-400 border-0">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="text-sm text-white">Freezing ({'<'}0°C)</div>
                    <div className="text-xs text-gray-400">Slippery floor warnings enabled</div>
                  </div>
                  <Badge className="bg-gray-700 text-gray-400 border-0">Standby</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="text-sm text-white">Heavy Rain ({'>'}10mm/h)</div>
                    <div className="text-xs text-gray-400">Outdoor work restricted</div>
                  </div>
                  <Badge className="bg-gray-700 text-gray-400 border-0">Standby</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Assistant */}
        <TabsContent value="voice" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <VoiceAssistant />

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Voice Command Benefits</CardTitle>
                <CardDescription className="text-gray-400">
                  Hands-free operation for busy supervisors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">Instant Incident Reporting</div>
                    <div className="text-xs text-gray-400">
                      Report safety incidents while on-site without touching your device
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center flex-shrink-0">
                    <Target className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">Quick Status Updates</div>
                    <div className="text-xs text-gray-400">
                      Get real-time zone status and alert counts through voice queries
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                    <Award className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">Safety-First Design</div>
                    <div className="text-xs text-gray-400">
                      Keep eyes on hazards while managing the safety system
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-800 rounded-lg mt-4">
                  <div className="text-xs text-gray-400 mb-2">Example Commands:</div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-300">"Hey SafeBot, show unacknowledged alerts"</div>
                    <div className="text-xs text-gray-300">"Report incident in Zone A"</div>
                    <div className="text-xs text-gray-300">"What are the high risk zones?"</div>
                    <div className="text-xs text-gray-300">"Acknowledge alert"</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gamification & Leaderboard */}
        <TabsContent value="gamification" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-yellow-900/30 to-gray-900 border-yellow-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Top Safe Workers of the Week
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Leaderboard based on safety points and compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.map((worker, idx) => (
                  <div
                    key={worker.id}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{
                        backgroundColor:
                          idx === 0 ? '#F59E0B' : idx === 1 ? '#9CA3AF' : idx === 2 ? '#CD7F32' : '#374151',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{worker.name}</div>
                      <div className="text-xs text-gray-400">{worker.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400" />
                        {worker.gamificationPoints}
                      </div>
                      <div className="text-xs text-gray-400">{worker.badges.length} badges</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Point System</CardTitle>
                <CardDescription className="text-gray-400">
                  How workers earn safety points
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-white">100% Daily PPE Compliance</div>
                      <div className="text-xs text-gray-400">Perfect helmet, vest, gloves</div>
                    </div>
                    <Badge className="bg-green-900/50 text-green-400 border-0">+100 pts</Badge>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-white">Quick Alert Response ({'<'}2 min)</div>
                      <div className="text-xs text-gray-400">Fast incident handling</div>
                    </div>
                    <Badge className="bg-blue-900/50 text-blue-400 border-0">+50 pts</Badge>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-white">Training Module Completed</div>
                      <div className="text-xs text-gray-400">Finish safety course</div>
                    </div>
                    <Badge className="bg-purple-900/50 text-purple-400 border-0">+200 pts</Badge>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-white">Near-Miss Reporting</div>
                      <div className="text-xs text-gray-400">Proactive safety awareness</div>
                    </div>
                    <Badge className="bg-yellow-900/50 text-yellow-400 border-0">+75 pts</Badge>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-white">Zero Violations (Weekly)</div>
                      <div className="text-xs text-gray-400">Clean safety record</div>
                    </div>
                    <Badge className="bg-orange-900/50 text-orange-400 border-0">+300 pts</Badge>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <div className="text-xs text-blue-400 mb-1">Gamification Impact:</div>
                  <div className="text-xs text-blue-300">
                    +23% increase in PPE compliance since launch
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Near-Miss Detection */}
        <TabsContent value="near-miss" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Recent Near-Miss Events
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-detected almost-accidents for proactive risk management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {nearMisses.slice(0, 5).map((miss) => (
                  <div
                    key={miss.id}
                    className="p-3 bg-gray-800 rounded-lg border-l-4"
                    style={{
                      borderLeftColor:
                        miss.severity === 'high' ? '#EF4444' : miss.severity === 'medium' ? '#F59E0B' : '#22C55E',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm text-white">{miss.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {miss.zone} • {miss.worker}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-yellow-600 text-yellow-400 text-xs"
                      >
                        {miss.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400 p-2 bg-gray-900 rounded">
                      Prevented: {miss.preventedIncident}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Near-Miss Heatmap</CardTitle>
                <CardDescription className="text-gray-400">
                  Identify zones with frequent near-misses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={nearMissHeatmap}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="zone" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <div className="text-xs text-yellow-400 mb-1">Action Required:</div>
                  <div className="text-xs text-yellow-300">
                    Roof - West has {zones.find(z => z.name === 'Roof - West')?.nearMissCount} near-misses. 
                    Recommend additional safety measures and training.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Digital Twin */}
        <TabsContent value="digital-twin" className="space-y-6">
          <DigitalTwinMap />

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Languages className="h-5 w-5 text-green-400" />
                  Multilingual Alerts
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Worker language preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workers.slice(0, 4).map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <div className="text-sm text-white">{worker.name}</div>
                      <Badge className="bg-gray-700 text-gray-300 border-0 text-xs">
                        {worker.preferredLanguage?.toUpperCase() || 'EN'}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-green-900/20 border border-green-800 rounded text-xs text-green-400">
                  Alerts auto-translated to each worker's preferred language
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  ESG Integration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Safety metrics impact ESG scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Social Score</span>
                      <span className="text-white">92/100</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      Improved by safety initiatives
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 p-2 bg-gray-800 rounded">
                    Fewer accidents → Better ESG ratings → Improved investor confidence
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/30 to-gray-900 border-blue-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  System Impact
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Overall safety improvements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Incidents Prevented</span>
                  <span className="text-green-400">-35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Response Time</span>
                  <span className="text-green-400">-52%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Worker Engagement</span>
                  <span className="text-green-400">+67%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
