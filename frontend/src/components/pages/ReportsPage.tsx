import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner@2.0.3';
import { generateSafetyReport } from '../../services/pdfGenerator';
import { useApp } from '../../context/AppContext';

const weeklyData = [
  { day: 'Mon', alerts: 12, resolved: 10 },
  { day: 'Tue', alerts: 8, resolved: 8 },
  { day: 'Wed', alerts: 15, resolved: 12 },
  { day: 'Thu', alerts: 11, resolved: 9 },
  { day: 'Fri', alerts: 9, resolved: 8 },
  { day: 'Sat', alerts: 5, resolved: 5 },
  { day: 'Sun', alerts: 3, resolved: 3 },
];

const alertTypeData = [
  { name: 'Helmet Missing', value: 45, color: '#EF4444' },
  { name: 'Vest Missing', value: 28, color: '#F59E0B' },
  { name: 'Fall Risk', value: 18, color: '#EAB308' },
  { name: 'Others', value: 9, color: '#6B7280' },
];

const complianceData = [
  { month: 'Jun', compliance: 82 },
  { month: 'Jul', compliance: 85 },
  { month: 'Aug', compliance: 88 },
  { month: 'Sep', compliance: 90 },
  { month: 'Oct', compliance: 91 },
  { month: 'Nov', compliance: 92 },
];

const reports = [
  {
    id: 1,
    name: 'Weekly Safety Report',
    date: 'Nov 1-6, 2025',
    type: 'Weekly',
    status: 'ready',
  },
  {
    id: 2,
    name: 'Monthly Compliance Report',
    date: 'October 2025',
    type: 'Monthly',
    status: 'ready',
  },
  {
    id: 3,
    name: 'Incident Analysis',
    date: 'Q3 2025',
    type: 'Quarterly',
    status: 'ready',
  },
];

export function ReportsPage() {
  const { alerts, workers, zones } = useApp();

  const downloadReport = (reportName: string, reportDate: string, reportType: string) => {
    try {
      const doc = generateSafetyReport(reportName, reportDate, reportType, {
        alerts,
        workers,
        zones,
      });
      
      // Save the PDF
      doc.save(`${reportName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
      
      toast.success('Report Downloaded', {
        description: `${reportName} has been downloaded successfully`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Download Failed', {
        description: 'Unable to generate PDF report. Please try again.',
      });
    }
  };

  const downloadAllReports = () => {
    toast.info('Preparing Reports', {
      description: 'Generating all reports... This may take a moment.',
    });
    
    reports.forEach((report, index) => {
      setTimeout(() => {
        downloadReport(report.name, report.date, report.type);
      }, index * 500);
    });
  };

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white mb-2">Reports & Analytics</h2>
          <p className="text-sm text-gray-400">Safety performance insights and compliance reports</p>
        </div>
        <Button 
          onClick={downloadAllReports}
          className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90"
        >
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Total Alerts</div>
                <div className="mt-1 text-2xl text-white">63</div>
                <p className="text-xs text-green-400 mt-2">-12% from last week</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Avg Response Time</div>
                <div className="mt-1 text-2xl text-white">12 min</div>
                <p className="text-xs text-green-400 mt-2">-3 min improvement</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Resolution Rate</div>
                <div className="mt-1 text-2xl text-white">94%</div>
                <p className="text-xs text-green-400 mt-2">+2% from last week</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">PPE Compliance</div>
                <div className="mt-1 text-2xl text-white">92%</div>
                <p className="text-xs text-green-400 mt-2">+4% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Alert Trend */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Weekly Alert Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="alerts" fill="#FF7A00" radius={[8, 8, 0, 0]} />
                <Bar dataKey="resolved" fill="#22C55E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alert Types Distribution */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Alert Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={alertTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {alertTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Trend */}
        <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">6-Month Compliance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="compliance" stroke="#3A4E7A" strokeWidth={3} dot={{ fill: '#3A4E7A', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-white">{report.name}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {report.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-gray-600 text-gray-400">{report.type}</Badge>
                  <Badge variant="outline" className="border-green-500 text-green-400">{report.status}</Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    onClick={() => downloadReport(report.name, report.date, report.type)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
