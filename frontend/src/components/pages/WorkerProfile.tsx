import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  User, 
  MapPin, 
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Bell,
  Video,
  HardHat,
  Shirt,
  Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner@2.0.3';
import { generateWorkerSafetyProfile } from '../../services/pdfGenerator';

export function WorkerProfile() {
  const { workers } = useApp();
  const [selectedWorker, setSelectedWorker] = useState(workers[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-500 text-green-400';
      case 'warning': return 'border-yellow-500 text-yellow-400';
      case 'offline': return 'border-gray-500 text-gray-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  const recentActivity = [
    { time: '10:23 AM', event: 'Entered Level 2 - West', type: 'zone' },
    { time: '09:45 AM', event: 'PPE Scan Passed', type: 'success' },
    { time: '09:12 AM', event: 'Helmet Missing Alert', type: 'alert' },
    { time: '08:30 AM', event: 'Checked In', type: 'zone' },
  ];

  const certifications = [
    { name: 'Fall Protection', expiry: 'Dec 2025', status: 'valid' },
    { name: 'Confined Space', expiry: 'Mar 2026', status: 'valid' },
    { name: 'First Aid', expiry: 'Nov 2025', status: 'expiring' },
    { name: 'Scaffold Training', expiry: 'Jan 2026', status: 'valid' },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-white mb-2">Worker Profiles</h2>
        <p className="text-sm text-gray-400">Monitor individual worker safety and compliance</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Workers List */}
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">All Workers ({workers.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {workers.map((worker) => (
                <button
                  key={worker.id}
                  onClick={() => setSelectedWorker(worker)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${selectedWorker.id === worker.id 
                      ? 'bg-[#FF7A00] text-white' 
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                    }
                  `}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback style={{ backgroundColor: '#3A4E7A', color: 'white' }}>
                      {worker.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm">{worker.name}</div>
                    <div className={`text-xs ${selectedWorker.id === worker.id ? 'text-white/70' : 'text-gray-500'}`}>
                      #{worker.id} • {worker.role}
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(worker.status)}>
                    {worker.status}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Worker Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback style={{ backgroundColor: '#3A4E7A', color: 'white', fontSize: '1.5rem' }}>
                    {selectedWorker.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl text-white">{selectedWorker.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">Worker ID: #{selectedWorker.id}</p>
                      <p className="text-sm text-gray-400">{selectedWorker.role}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(selectedWorker.status)}>
                      {selectedWorker.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{selectedWorker.zone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Last Alert: {selectedWorker.lastAlert}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PPE Compliance Score */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">PPE Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl text-white">{selectedWorker.ppeScore}%</div>
                <div className={`text-sm ${selectedWorker.ppeScore >= 90 ? 'text-green-400' : selectedWorker.ppeScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {selectedWorker.ppeScore >= 90 ? 'Excellent' : selectedWorker.ppeScore >= 70 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              <Progress value={selectedWorker.ppeScore} className="h-3 bg-gray-800" />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <HardHat className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-sm text-white">Helmet</div>
                    <div className="text-xs text-gray-400">98% compliance</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Shirt className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-sm text-white">Vest</div>
                    <div className="text-xs text-gray-400">95% compliance</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="bg-gray-900 border border-gray-800">
              <TabsTrigger value="activity" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Activity</TabsTrigger>
              <TabsTrigger value="certifications" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Certifications</TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Alerts History</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0 last:pb-0">
                      <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center
                        ${activity.type === 'success' ? 'bg-green-900/50' : ''}
                        ${activity.type === 'alert' ? 'bg-red-900/50' : ''}
                        ${activity.type === 'zone' ? 'bg-blue-900/50' : ''}
                      `}>
                        {activity.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                        {activity.type === 'alert' && <AlertTriangle className="h-4 w-4 text-red-400" />}
                        {activity.type === 'zone' && <MapPin className="h-4 w-4 text-blue-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white">{activity.event}</div>
                        <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certifications">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Certifications & Training</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className={`h-5 w-5 ${cert.status === 'valid' ? 'text-green-400' : 'text-yellow-400'}`} />
                        <div>
                          <div className="text-sm text-white">{cert.name}</div>
                          <div className="text-xs text-gray-400">Expires: {cert.expiry}</div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cert.status === 'valid' ? 'border-green-500 text-green-400' : 'border-yellow-500 text-yellow-400'}
                      >
                        {cert.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Alert History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-800">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-white">Helmet Missing</div>
                      <div className="text-xs text-gray-400 mt-1">Level 2 - West • 09:12 AM</div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-400">Resolved</Badge>
                  </div>
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-800">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-white">Safety Vest Not Detected</div>
                      <div className="text-xs text-gray-400 mt-1">Ground Floor • Yesterday 3:24 PM</div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-400">Resolved</Badge>
                  </div>
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Total alerts this week: 2
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button className="flex-1 bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90">
                <Bell className="h-4 w-4 mr-2" />
                Send Alert
              </Button>
              <Button variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
                <Video className="h-4 w-4 mr-2" />
                View Camera
              </Button>
              <Button variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
