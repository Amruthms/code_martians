import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Leaf,
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Award,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function ESGAnalytics() {
  const { esgMetrics, safetyScore } = useApp();

  const environmentalMetrics = esgMetrics.filter(m => m.category === 'environmental');
  const socialMetrics = esgMetrics.filter(m => m.category === 'social');
  const governanceMetrics = esgMetrics.filter(m => m.category === 'governance');

  // ESG Score Distribution
  const esgScoreData = [
    { name: 'Environmental', value: 85, color: '#22C55E' },
    { name: 'Social', value: 92, color: '#3A4E7A' },
    { name: 'Governance', value: 96, color: '#FF7A00' },
  ];

  // Carbon Reduction Timeline
  const carbonData = [
    { month: 'Jan', reduction: 8.2 },
    { month: 'Feb', reduction: 9.1 },
    { month: 'Mar', reduction: 10.3 },
    { month: 'Apr', reduction: 11.0 },
    { month: 'May', reduction: 11.8 },
    { month: 'Jun', reduction: 12.5 },
  ];

  // Safety vs ESG Correlation
  const correlationData = [
    { week: 'W1', safety: 85, esg: 82 },
    { week: 'W2', safety: 88, esg: 85 },
    { week: 'W3', safety: 90, esg: 88 },
    { week: 'W4', safety: 92, esg: 91 },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const overallESGScore = Math.round(
    (esgScoreData.reduce((acc, item) => acc + item.value, 0) / esgScoreData.length)
  );

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl text-white mb-2">ESG & Sustainability Analytics</h2>
        <p className="text-sm text-gray-400">Environmental, Social & Governance metrics aligned with Nordic standards</p>
      </div>

      {/* Overall ESG Score Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-900/50 to-gray-900 border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Overall ESG Score</CardTitle>
            <Award className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-400 mb-1">{overallESGScore}/100</div>
            <Progress value={overallESGScore} className="h-2 bg-gray-800" />
            <p className="text-xs text-gray-400 mt-2">
              <span className="text-green-400">+5 points</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Environmental</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">85/100</div>
            <Badge className="bg-green-900/50 text-green-400 border-0">Strong</Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Social</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">92/100</div>
            <Badge className="bg-blue-900/50 text-blue-400 border-0">Excellent</Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Governance</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">96/100</div>
            <Badge className="bg-orange-900/50 text-orange-400 border-0">Outstanding</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Environmental & Social */}
        <div className="lg:col-span-2 space-y-6">
          {/* ESG Score Distribution */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">ESG Score Distribution</CardTitle>
              <CardDescription className="text-gray-400">Balanced performance across all pillars</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={esgScoreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {esgScoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {esgScoreData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-white">{item.value}/100</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Metrics */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-400" />
                <CardTitle className="text-white">Environmental Impact</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Sustainability and resource efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {environmentalMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">{metric.metric}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="text-right">
                      <span className="text-white">{metric.value}{metric.unit}</span>
                      <span className="text-xs text-gray-400 ml-1">/ {metric.target}{metric.unit}</span>
                    </div>
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="h-2 bg-gray-800" 
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Carbon Reduction Timeline */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">CO₂ Emissions Reduction Progress</CardTitle>
              <CardDescription className="text-gray-400">Monthly carbon footprint reduction (tons)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={carbonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Line type="monotone" dataKey="reduction" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Social Metrics */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">Social Responsibility</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Worker safety, wellbeing & development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">{metric.metric}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="text-right">
                      <span className="text-white">{metric.value}{metric.unit}</span>
                      <span className="text-xs text-gray-400 ml-1">/ {metric.target}{metric.unit}</span>
                    </div>
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="h-2 bg-gray-800" 
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Governance & Insights */}
        <div className="space-y-6">
          {/* Governance Metrics */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-400" />
                <CardTitle className="text-white">Governance</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Compliance & audit performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {governanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">{metric.metric}</span>
                    <span className={getTrendColor(metric.trend)}>
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="h-2 bg-gray-800" 
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Target: {metric.target}{metric.unit}</span>
                    <span>{Math.round((metric.value / metric.target) * 100)}% achieved</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Safety-ESG Correlation */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Safety-ESG Correlation</CardTitle>
              <CardDescription className="text-gray-400">How safety impacts ESG performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Line type="monotone" dataKey="safety" stroke="#3A4E7A" strokeWidth={2} name="Safety Score" />
                  <Line type="monotone" dataKey="esg" stroke="#22C55E" strokeWidth={2} name="ESG Score" />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-3">
                Strong positive correlation: Better safety practices improve overall ESG scores
              </p>
            </CardContent>
          </Card>

          {/* Regulatory Compliance */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Regulatory Compliance</CardTitle>
              <CardDescription className="text-gray-400">Nordic & EU standards adherence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <div className="text-sm text-white">EU Directive 92/57/EEC</div>
                  <div className="text-xs text-gray-400">Construction Sites</div>
                </div>
                <Badge className="bg-green-900/50 text-green-400 border-0">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <div className="text-sm text-white">AFS 2001:1</div>
                  <div className="text-xs text-gray-400">Swedish Work Environment</div>
                </div>
                <Badge className="bg-green-900/50 text-green-400 border-0">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <div className="text-sm text-white">ISO 45001:2018</div>
                  <div className="text-xs text-gray-400">Occupational Health & Safety</div>
                </div>
                <Badge className="bg-green-900/50 text-green-400 border-0">Certified</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <div className="text-sm text-white">GDPR</div>
                  <div className="text-xs text-gray-400">Data Protection</div>
                </div>
                <Badge className="bg-green-900/50 text-green-400 border-0">Compliant</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="bg-gradient-to-br from-blue-900/30 to-gray-900 border-blue-800">
            <CardHeader>
              <CardTitle className="text-white">Key Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <Target className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <span className="text-blue-400">12.5 tons</span> CO₂ emissions reduced this quarter, exceeding target by 15%
                </p>
              </div>
              <div className="flex gap-2">
                <TrendingUp className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  Worker safety index improved by <span className="text-green-400">7%</span> since implementing AI monitoring
                </p>
              </div>
              <div className="flex gap-2">
                <Award className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  On track for <span className="text-yellow-400">Nordic Excellence</span> certification in Q4 2025
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
