import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Construction, 
  AlertTriangle, 
  Users, 
  Download,
  Radio,
  Shield,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface Machine {
  id: number;
  name: string;
  type: 'crane' | 'excavator' | 'loader' | 'truck' | 'mixer';
  position: { x: number; y: number };
  status: 'active' | 'idle' | 'maintenance';
  riskLevel: 'low' | 'medium' | 'high';
}

interface WorkerPosition {
  id: number;
  name: string;
  position: { x: number; y: number };
  zone: string;
  status: 'safe' | 'warning' | 'danger';
}

interface HeatZone {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  type: 'safe' | 'caution' | 'restricted' | 'danger';
}

export function SiteMap() {
  const { zones, addAlert } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showMachines, setShowMachines] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [liveAlerts, setLiveAlerts] = useState<string[]>([]);

  const [machines] = useState<Machine[]>([
    { id: 1, name: 'Tower Crane A', type: 'crane', position: { x: 150, y: 100 }, status: 'active', riskLevel: 'high' },
    { id: 2, name: 'Excavator B-12', type: 'excavator', position: { x: 400, y: 250 }, status: 'active', riskLevel: 'high' },
    { id: 3, name: 'Concrete Mixer', type: 'mixer', position: { x: 600, y: 400 }, status: 'idle', riskLevel: 'medium' },
    { id: 4, name: 'Loader C-03', type: 'loader', position: { x: 300, y: 450 }, status: 'active', riskLevel: 'medium' },
    { id: 5, name: 'Dump Truck', type: 'truck', position: { x: 700, y: 150 }, status: 'maintenance', riskLevel: 'low' },
  ]);

  const [workerPositions, setWorkerPositions] = useState<WorkerPosition[]>([
    { id: 12, name: 'Erik A.', position: { x: 350, y: 280 }, zone: 'Level 2 - West', status: 'warning' },
    { id: 7, name: 'Maria J.', position: { x: 500, y: 450 }, zone: 'Ground Floor', status: 'safe' },
    { id: 23, name: 'Lars N.', position: { x: 180, y: 120 }, zone: 'Roof - West', status: 'danger' },
    { id: 45, name: 'Anna B.', position: { x: 650, y: 380 }, zone: 'Ground Floor', status: 'safe' },
  ]);

  const [heatZones] = useState<HeatZone[]>([
    { x: 150, y: 100, radius: 80, intensity: 90, type: 'danger' },
    { x: 400, y: 250, radius: 100, intensity: 85, type: 'danger' },
    { x: 600, y: 400, radius: 60, intensity: 50, type: 'caution' },
    { x: 300, y: 450, radius: 70, intensity: 60, type: 'restricted' },
    { x: 700, y: 150, radius: 50, intensity: 30, type: 'caution' },
  ]);

  // Check worker safety
  useEffect(() => {
    const checkWorkerSafety = () => {
      workerPositions.forEach(worker => {
        heatZones.forEach(zone => {
          const distance = Math.sqrt(
            Math.pow(worker.position.x - zone.x, 2) + 
            Math.pow(worker.position.y - zone.y, 2)
          );
          
          if (distance < zone.radius && zone.type === 'danger') {
            const alertMessage = `${worker.name} entered dangerous zone near machinery!`;
            
            if (!liveAlerts.includes(alertMessage)) {
              setLiveAlerts(prev => [...prev, alertMessage]);
              
              addAlert({
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                zone: worker.zone,
                type: 'Dangerous Zone Entry',
                severity: 'critical',
                status: 'pending',
                assignedTo: 'Site Supervisor',
                worker: worker.name,
                confidence: 98,
              });
              
              toast.error('⚠️ DANGER ZONE ALERT', {
                description: alertMessage,
                duration: 8000,
              });

              setWorkerPositions(prev =>
                prev.map(w =>
                  w.id === worker.id ? { ...w, status: 'danger' } : w
                )
              );
            }
          }
        });
      });
    };

    const interval = setInterval(checkWorkerSafety, 2000);
    return () => clearInterval(interval);
  }, [workerPositions, heatZones, liveAlerts, addAlert]);

  // Simulate worker movement
  useEffect(() => {
    const moveWorkers = () => {
      setWorkerPositions(prev =>
        prev.map(worker => ({
          ...worker,
          position: {
            x: Math.max(50, Math.min(750, worker.position.x + (Math.random() - 0.5) * 20)),
            y: Math.max(50, Math.min(500, worker.position.y + (Math.random() - 0.5) * 20)),
          },
        }))
      );
    };

    const interval = setInterval(moveWorkers, 3000);
    return () => clearInterval(interval);
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Heat map
    if (showHeatMap) {
      heatZones.forEach(zone => {
        const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius);
        
        let color1, color2;
        switch (zone.type) {
          case 'danger':
            color1 = `rgba(239, 68, 68, ${zone.intensity / 150})`;
            color2 = 'rgba(239, 68, 68, 0)';
            break;
          case 'restricted':
            color1 = `rgba(255, 122, 0, ${zone.intensity / 150})`;
            color2 = 'rgba(255, 122, 0, 0)';
            break;
          case 'caution':
            color1 = `rgba(245, 158, 11, ${zone.intensity / 200})`;
            color2 = 'rgba(245, 158, 11, 0)';
            break;
          default:
            color1 = `rgba(16, 185, 129, ${zone.intensity / 200})`;
            color2 = 'rgba(16, 185, 129, 0)';
        }
        
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Zones
    if (showZones) {
      zones.forEach(zone => {
        const x = (zone.position.x / 100) * canvas.width;
        const y = (zone.position.y / 100) * canvas.height;
        const width = (zone.position.width / 100) * canvas.width;
        const height = (zone.position.height / 100) * canvas.height;

        ctx.strokeStyle = zone.status === 'danger' ? '#EF4444' : 
                         zone.status === 'restricted' ? '#FF7A00' : '#3A4E7A';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(zone.name, x + 5, y + 15);
      });
    }

    // Machines
    if (showMachines) {
      machines.forEach(machine => {
        ctx.fillStyle = machine.status === 'active' ? '#FF7A00' : 
                       machine.status === 'idle' ? '#888888' : '#666666';
        ctx.beginPath();
        ctx.arc(machine.position.x, machine.position.y, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let icon = '';
        switch (machine.type) {
          case 'crane': icon = '🏗️'; break;
          case 'excavator': icon = '🚜'; break;
          case 'loader': icon = '🚧'; break;
          case 'truck': icon = '🚚'; break;
          case 'mixer': icon = '🔧'; break;
        }
        
        ctx.fillText(icon, machine.position.x, machine.position.y);

        if (machine.riskLevel === 'high') {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(machine.position.x, machine.position.y, 60, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    // Workers
    if (showWorkers) {
      workerPositions.forEach(worker => {
        ctx.fillStyle = worker.status === 'danger' ? '#EF4444' : 
                       worker.status === 'warning' ? '#F59E0B' : '#10B981';
        ctx.beginPath();
        ctx.arc(worker.position.x, worker.position.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(worker.position.x, worker.position.y, 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(worker.name.substring(0, 2), worker.position.x, worker.position.y);

        if (worker.status === 'danger') {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(worker.position.x, worker.position.y, 20, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }
  }, [showHeatMap, showMachines, showWorkers, showZones, machines, workerPositions, heatZones, zones]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    machines.forEach(machine => {
      const distance = Math.sqrt(
        Math.pow(x - machine.position.x, 2) + 
        Math.pow(y - machine.position.y, 2)
      );
      if (distance < 15) {
        setSelectedItem(`Machine: ${machine.name} - Status: ${machine.status}`);
      }
    });

    workerPositions.forEach(worker => {
      const distance = Math.sqrt(
        Math.pow(x - worker.position.x, 2) + 
        Math.pow(y - worker.position.y, 2)
      );
      if (distance < 12) {
        setSelectedItem(`Worker: ${worker.name} - Zone: ${worker.zone} - Status: ${worker.status}`);
      }
    });
  };

  const exportSiteMapPDF = () => {
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    pdf.setFontSize(20);
    pdf.text('Construction Site Map Report', 148.5, 15, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 148.5, 22, { align: 'center' });
    
    const canvas = canvasRef.current;
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 30, 277, 150);
    }
    
    pdf.save(`site-map-report-${Date.now()}.pdf`);
    toast.success('Site Map PDF Downloaded', {
      description: 'Site map report has been generated',
    });
  };

  const clearAlerts = () => {
    setLiveAlerts([]);
    toast.success('Alerts cleared');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="mx-auto max-w-[1800px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Site Map & Heat Zones</h1>
            <p className="text-gray-400">Real-time site monitoring with machine locations and danger zone alerts</p>
          </div>
          <Button 
            onClick={exportSiteMapPDF}
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        {/* Live Alerts */}
        {liveAlerts.length > 0 && (
          <Alert className="border-red-500/40 bg-red-950/30 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <AlertDescription className="text-white flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 font-semibold">
                  {liveAlerts.length} Active Danger Zone Alert{liveAlerts.length !== 1 ? 's' : ''}
                </div>
                {liveAlerts.slice(0, 3).map((alert, idx) => (
                  <div key={idx} className="text-sm text-gray-300">• {alert}</div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAlerts}
                className="border-red-500/40 text-red-400 hover:bg-red-950/40"
              >
                Clear
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content - Map and Controls */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Controls Panel - 50% width */}
          <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur-sm shadow-xl h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2.5 text-lg">
                <MapPin className="h-5 w-5 text-[#FF7A00]" />
                Map Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Layer toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all border border-gray-700/30">
                  <Label htmlFor="heat-map" className="text-gray-100 cursor-pointer font-medium flex items-center gap-3 text-base">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Heat Map Zones
                  </Label>
                  <Switch 
                    id="heat-map" 
                    checked={showHeatMap} 
                    onCheckedChange={setShowHeatMap}
                    className="ml-4"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all border border-gray-700/30">
                  <Label htmlFor="machines" className="text-gray-100 cursor-pointer font-medium flex items-center gap-3 text-base">
                    <Construction className="h-4 w-4 text-blue-500" />
                    Machines
                  </Label>
                  <Switch 
                    id="machines" 
                    checked={showMachines} 
                    onCheckedChange={setShowMachines}
                    className="ml-4"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all border border-gray-700/30">
                  <Label htmlFor="workers" className="text-gray-100 cursor-pointer font-medium flex items-center gap-3 text-base">
                    <Users className="h-4 w-4 text-green-500" />
                    Workers
                  </Label>
                  <Switch 
                    id="workers" 
                    checked={showWorkers} 
                    onCheckedChange={setShowWorkers}
                    className="ml-4"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all border border-gray-700/30">
                  <Label htmlFor="zones" className="text-gray-100 cursor-pointer font-medium flex items-center gap-3 text-base">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Zone Boundaries
                  </Label>
                  <Switch 
                    id="zones" 
                    checked={showZones} 
                    onCheckedChange={setShowZones}
                    className="ml-4"
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3 border-t border-gray-700/50 pt-5">
                <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">Legend</h3>
                
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 w-3.5 rounded-full bg-red-500 shadow-sm flex-shrink-0"></div>
                    <span className="text-sm text-gray-300">Danger Zone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 w-3.5 rounded-full bg-[#FF7A00] shadow-sm flex-shrink-0"></div>
                    <span className="text-sm text-gray-300">Restricted Zone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 w-3.5 rounded-full bg-yellow-400 shadow-sm flex-shrink-0"></div>
                    <span className="text-sm text-gray-300">Caution Zone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 w-3.5 rounded-full bg-green-500 shadow-sm flex-shrink-0"></div>
                    <span className="text-sm text-gray-300">Safe Zone</span>
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-gray-700/50 pt-4 mt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-base flex-shrink-0">🏗️</span>
                    <span className="text-sm text-gray-300">Tower Crane</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base flex-shrink-0">🚜</span>
                    <span className="text-sm text-gray-300">Excavator</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base flex-shrink-0">🚧</span>
                    <span className="text-sm text-gray-300">Loader</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm flex-shrink-0">🚚</span>
                    <span className="text-xs text-gray-300">Truck</span>
                  </div>
                </div>
              </div>

              {/* Selected Item Info */}
              {selectedItem && (
                <div className="space-y-2 border-t border-gray-700/50 pt-4">
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wide">Selection</h3>
                  <p className="text-xs text-gray-300 p-2.5 bg-gray-800/40 rounded-lg border border-gray-700/50">{selectedItem}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedItem(null)}
                    className="w-full bg-gray-800/40 border-gray-700 text-white hover:bg-gray-700 text-xs"
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map Canvas - Takes remaining space */}
          <div className="space-y-4">
            <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2.5">
                    <Shield className="h-5 w-5 text-[#FF7A00]" />
                    Interactive Site Map
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1">
                    <Radio className="mr-1.5 h-3 w-3" />
                    Live Tracking
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-black/80 p-3 border border-gray-800/60 shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={550}
                    className="w-full cursor-crosshair rounded-lg"
                    onClick={handleCanvasClick}
                  />
                </div>

                {/* Status Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-black p-4 border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                        <Users className="h-4 w-4" />
                        <span>Workers</span>
                      </div>
                      <div className="text-white text-3xl font-bold">{workerPositions.length}</div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-black p-4 border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                        <Construction className="h-4 w-4" />
                        <span>Machines</span>
                      </div>
                      <div className="text-white text-3xl font-bold">
                        {machines.filter(m => m.status === 'active').length}/{machines.length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-black p-4 border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Danger Zones</span>
                      </div>
                      <div className="text-white text-3xl font-bold">{heatZones.filter(z => z.type === 'danger').length}</div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-black p-4 border border-red-500/20 hover:border-red-500/40 transition-colors">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                        <Zap className="h-4 w-4" />
                        <span>At Risk</span>
                      </div>
                      <div className="text-red-500 text-3xl font-bold">
                        {workerPositions.filter(w => w.status === 'danger').length}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Machine & Worker Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Machine Status */}
          <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2.5 text-lg">
                <Construction className="h-5 w-5 text-[#FF7A00]" />
                Machine Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {machines.map(machine => (
                  <div 
                    key={machine.id}
                    className="rounded-xl bg-black/60 p-4 border border-gray-800/60 hover:border-gray-700/80 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">
                        {machine.type === 'crane' && '🏗️'}
                        {machine.type === 'excavator' && '🚜'}
                        {machine.type === 'loader' && '🚧'}
                        {machine.type === 'truck' && '🚚'}
                        {machine.type === 'mixer' && '🔧'}
                      </div>
                      <Badge 
                        className={`px-2.5 py-0.5 text-xs font-medium ${
                          machine.status === 'active' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                          machine.status === 'idle' 
                            ? 'bg-gray-500/10 text-gray-400 border-gray-500/30' :
                            'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {machine.status}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold mb-1 text-base">{machine.name}</h3>
                    <p className="text-sm text-gray-400 capitalize mb-3 font-medium">{machine.type}</p>
                    <div className="flex items-center gap-2">
                      <AlertTriangle 
                        className={`h-4 w-4 ${
                          machine.riskLevel === 'high' ? 'text-red-500' :
                          machine.riskLevel === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}
                      />
                      <span className="text-sm text-gray-400 capitalize font-medium">
                        {machine.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Worker Tracking */}
          <Card className="border-gray-800/50 bg-gray-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2.5 text-lg">
                <Users className="h-5 w-5 text-[#FF7A00]" />
                Live Worker Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {workerPositions.map(worker => (
                  <div 
                    key={worker.id}
                    className="rounded-xl bg-black/60 p-4 border border-gray-800/60 hover:border-gray-700/80 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className={`h-3 w-3 rounded-full ${
                            worker.status === 'danger' ? 'bg-red-500 animate-pulse' :
                            worker.status === 'warning' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                        />
                        <span className="text-white font-semibold text-base">{worker.name}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-2 font-medium">{worker.zone}</p>
                    <div className="text-xs text-gray-500 font-medium mb-3">
                      Position: ({Math.round(worker.position.x)}, {Math.round(worker.position.y)})
                    </div>
                    {worker.status === 'danger' && (
                      <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        <Zap className="h-3 w-3" />
                        In Danger Zone!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
