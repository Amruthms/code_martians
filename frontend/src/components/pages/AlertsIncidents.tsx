import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Camera,
  FileText,
  Trash2,
  Download,
  Video,
  VideoOff
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { generateIncidentReport } from '../../services/pdfGenerator';

export function AlertsIncidents() {
  const { alerts, updateAlertStatus, deleteAlert } = useApp();
  const [selectedAlert, setSelectedAlert] = useState(alerts[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [cameraActive, setCameraActive] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const filteredAlerts = filterStatus === 'all' 
    ? alerts 
    : alerts.filter(a => a.status === filterStatus);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-600 text-red-400';
      case 'high': return 'border-red-500 text-red-400';
      case 'medium': return 'border-yellow-500 text-yellow-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'border-green-600 text-green-400';
      case 'acknowledged': return 'border-yellow-500 text-yellow-400';
      case 'pending': return 'border-red-500 text-red-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  const handleAcknowledge = (id: number) => {
    updateAlertStatus(id, 'acknowledged');
  };

  const handleResolve = (id: number) => {
    updateAlertStatus(id, 'resolved');
  };

  const downloadIncidentReport = (alert: any) => {
    try {
      const doc = generateIncidentReport(alert);
      doc.save(`Incident_Report_${alert.id}_${Date.now()}.pdf`);
      
      toast.success('Report Downloaded', {
        description: `Incident report for ${alert.type} has been downloaded`,
      });
    } catch (error) {
      console.error('Error generating incident report:', error);
      toast.error('Download Failed', {
        description: 'Unable to generate incident report',
      });
    }
  };

  const startCamera = () => {
    if (imgRef.current) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const streamUrl = `${apiUrl}/video_feed?cache=${Date.now()}`;
      imgRef.current.src = streamUrl;
      setCameraActive(true);
      toast.success('Camera Started', { description: 'Live webcam feed is now active' });
    }
  };

  const stopCamera = () => {
    if (imgRef.current) {
      imgRef.current.src = '';
      setCameraActive(false);
      toast.info('Camera Stopped', { description: 'Live feed has been stopped' });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-white mb-2">Alerts & Incidents</h2>
        <p className="text-sm text-gray-400">Monitor and manage all safety alerts and incidents</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Total Today</div>
                <div className="mt-1 text-2xl text-white">{alerts.length}</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Pending</div>
                <div className="mt-1 text-2xl text-red-400">
                  {alerts.filter(a => a.status === 'pending').length}
                </div>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Resolved</div>
                <div className="mt-1 text-2xl text-green-400">
                  {alerts.filter(a => a.status === 'resolved').length}
                </div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Avg Response</div>
                <div className="mt-1 text-2xl text-white">12 min</div>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alerts Table */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">All Alerts</CardTitle>
                <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                  <TabsList className="bg-gray-800">
                    <TabsTrigger value="all" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">All</TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Pending</TabsTrigger>
                    <TabsTrigger value="acknowledged" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Ack.</TabsTrigger>
                    <TabsTrigger value="resolved" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Resolved</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-800/50">
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                      <TableHead className="text-gray-300">Time</TableHead>
                      <TableHead className="text-gray-300">Zone</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow
                        key={alert.id}
                        className="cursor-pointer hover:bg-gray-800/50 border-gray-800"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <TableCell className="text-gray-300">
                          <div className="text-sm">{alert.time}</div>
                          <div className="text-xs text-gray-500">{alert.date}</div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{alert.zone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAlert(alert.id);
                            }}
                            className="text-gray-400 hover:text-red-400 hover:bg-gray-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredAlerts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No alerts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Details Sidebar */}
        <div>
          {selectedAlert && (
            <Card className="sticky top-6 bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Alert Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Live Camera Feed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400">Camera Snapshot</div>
                    {!cameraActive ? (
                      <Button 
                        size="sm" 
                        onClick={startCamera}
                        className="h-7 text-xs bg-[#FF7A00] hover:bg-[#FF7A00]/90"
                      >
                        <Video className="h-3 w-3 mr-1" />
                        Start Live Feed
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={stopCamera}
                        variant="outline"
                        className="h-7 text-xs border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <VideoOff className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    )}
                  </div>
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center border-2 border-red-500 overflow-hidden relative">
                    {cameraActive ? (
                      <>
                        <img
                          ref={imgRef}
                          className="absolute inset-0 w-full h-full object-contain"
                          alt="Live Camera Feed"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-white text-xs font-medium">LIVE</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="h-12 w-12 text-gray-600" />
                        <p className="text-xs text-gray-500">Click "Start Live Feed" to view camera</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    AI Confidence: {selectedAlert.confidence}%
                  </div>
                </div>

                {/* Alert Information */}
                <div className="space-y-3 pt-3 border-t border-gray-800">
                  <div>
                    <div className="text-sm text-gray-400">Alert Type</div>
                    <div className="mt-1">
                      <Badge variant="outline" className={getSeverityColor(selectedAlert.severity)}>
                        {selectedAlert.type}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Location</div>
                    <div className="flex items-center gap-2 mt-1 text-white">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedAlert.zone}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Worker</div>
                    <div className="flex items-center gap-2 mt-1 text-white">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedAlert.worker}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Assigned To</div>
                    <div className="text-sm mt-1 text-white">{selectedAlert.assignedTo}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Time</div>
                    <div className="text-sm mt-1 text-white">
                      {selectedAlert.time} - {selectedAlert.date}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Status</div>
                    <div className="mt-1">
                      <Badge variant="outline" className={getStatusColor(selectedAlert.status)}>
                        {selectedAlert.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-3 border-t border-gray-800">
                  {selectedAlert.status === 'pending' && (
                    <Button 
                      className="w-full text-white"
                      style={{ backgroundColor: '#FF7A00' }}
                      onClick={() => handleAcknowledge(selectedAlert.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Acknowledge
                    </Button>
                  )}
                  {selectedAlert.status === 'acknowledged' && (
                    <Button 
                      className="w-full"
                      style={{ backgroundColor: '#22C55E', color: 'white' }}
                      onClick={() => handleResolve(selectedAlert.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                    onClick={() => downloadIncidentReport(selectedAlert)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                    onClick={() => toast.info('Escalation', { description: 'Alert escalated to senior supervisor' })}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Escalate
                  </Button>
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                    <FileText className="h-4 w-4 mr-2" />
                    Create CAPA
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
