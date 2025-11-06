import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Navigation, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  Siren
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';

export function EmergencyEvacuation() {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [evacuationDialogOpen, setEvacuationDialogOpen] = useState(false);

  const emergencyContacts = [
    { name: 'Fire Department', number: '110', type: 'fire' },
    { name: 'Ambulance', number: '113', type: 'medical' },
    { name: 'Police', number: '112', type: 'police' },
    { name: 'Site Manager', number: '+47 123 45 678', type: 'internal' },
  ];

  const evacuationZones = [
    { 
      zone: 'Level 1 - East', 
      workers: 3, 
      status: 'evacuated', 
      exit: 'Exit A (East Gate)', 
      time: '2 min',
      assemblyPoint: 'Assembly Point A - Parking Lot'
    },
    { 
      zone: 'Level 1 - West', 
      workers: 2, 
      status: 'in-progress', 
      exit: 'Exit B (West Gate)', 
      time: '4 min',
      assemblyPoint: 'Assembly Point B - Storage Area'
    },
    { 
      zone: 'Level 2 - North', 
      workers: 5, 
      status: 'in-progress', 
      exit: 'Emergency Stairs - North', 
      time: '3 min',
      assemblyPoint: 'Assembly Point A - Parking Lot'
    },
    { 
      zone: 'Roof - West', 
      workers: 1, 
      status: 'pending', 
      exit: 'Emergency Ladder - South', 
      time: '6 min',
      assemblyPoint: 'Assembly Point C - South Yard'
    },
    { 
      zone: 'Ground Floor', 
      workers: 6, 
      status: 'evacuated', 
      exit: 'Main Exit', 
      time: '1 min',
      assemblyPoint: 'Assembly Point A - Parking Lot'
    },
  ];

  const handleEmergencyActivation = () => {
    setEmergencyActive(true);
    setEvacuationDialogOpen(true);
    // In real implementation, this would:
    // - Sound site alarms
    // - Send notifications to all workers
    // - Display evacuation routes on screens
    // - Log emergency event
    // - Notify emergency services
  };

  const handleEmergencyDeactivation = () => {
    setEmergencyActive(false);
    setEvacuationDialogOpen(false);
  };

  const totalWorkers = evacuationZones.reduce((sum, zone) => sum + zone.workers, 0);
  const evacuatedWorkers = evacuationZones
    .filter(z => z.status === 'evacuated')
    .reduce((sum, zone) => sum + zone.workers, 0);
  const evacuationProgress = Math.round((evacuatedWorkers / totalWorkers) * 100);

  return (
    <>
      <Card className={`${emergencyActive ? 'bg-red-950 border-red-600 animate-pulse' : 'bg-gray-900 border-gray-800'} transition-all`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${emergencyActive ? 'text-red-400' : 'text-gray-400'}`} />
              Emergency Response
            </div>
            {emergencyActive && (
              <Badge className="bg-red-500 text-white animate-pulse">ACTIVE</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!emergencyActive ? (
            <>
              <p className="text-sm text-gray-400">
                Activate emergency evacuation protocol if needed
              </p>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={handleEmergencyActivation}
              >
                <Siren className="h-4 w-4 mr-2" />
                Activate Emergency Evacuation
              </Button>
              <div className="pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-400 mb-2">Emergency Contacts</div>
                <div className="grid grid-cols-2 gap-2">
                  {emergencyContacts.map((contact, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 justify-start"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {contact.number}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-red-900/50 border border-red-600 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Siren className="h-5 w-5 text-red-400 animate-pulse" />
                  <span className="text-red-400">Emergency Protocol Active</span>
                </div>
                <div className="text-xs text-gray-300">
                  All workers have been notified. Evacuation in progress.
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Evacuation Progress</span>
                  <span className="text-white">{evacuatedWorkers}/{totalWorkers} workers</span>
                </div>
                <Progress value={evacuationProgress} className="h-2 bg-gray-800" />
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => setEvacuationDialogOpen(true)}
                >
                  View Status
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-700 text-gray-300"
                  onClick={handleEmergencyDeactivation}
                >
                  Deactivate
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Evacuation Status Dialog */}
      <Dialog open={evacuationDialogOpen} onOpenChange={setEvacuationDialogOpen}>
        <DialogContent className="bg-gray-900 border-red-600 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <Siren className="h-6 w-6" />
              </div>
              <div>
                <div>Emergency Evacuation Active</div>
                <div className="text-sm text-gray-400">Real-time evacuation monitoring</div>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Emergency evacuation status dashboard showing real-time progress, zone status, and emergency contacts
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-xl text-white">{evacuatedWorkers} of {totalWorkers} Workers Evacuated</div>
                  <div className="text-sm text-gray-400">Evacuation Progress: {evacuationProgress}%</div>
                </div>
                <div className="text-4xl text-red-400">{evacuationProgress}%</div>
              </div>
              <Progress value={evacuationProgress} className="h-3 bg-gray-800" />
            </div>

            {/* Emergency Contacts */}
            <div>
              <h3 className="text-white mb-3">Emergency Services Notified</h3>
              <div className="grid grid-cols-2 gap-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-3 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">{contact.name}</div>
                      <div className="text-xs text-gray-400">{contact.number}</div>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone Status */}
            <div>
              <h3 className="text-white mb-3">Evacuation Status by Zone</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {evacuationZones.map((zone, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      zone.status === 'evacuated' 
                        ? 'bg-green-950/30 border-green-700' 
                        : zone.status === 'in-progress'
                        ? 'bg-yellow-950/30 border-yellow-700'
                        : 'bg-red-950/30 border-red-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-white">{zone.zone}</span>
                          <Badge className={`
                            ${zone.status === 'evacuated' ? 'bg-green-900 text-green-400' : ''}
                            ${zone.status === 'in-progress' ? 'bg-yellow-900 text-yellow-400' : ''}
                            ${zone.status === 'pending' ? 'bg-red-900 text-red-400' : ''}
                            border-0
                          `}>
                            {zone.status === 'evacuated' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {zone.status === 'in-progress' && <Clock className="h-3 w-3 mr-1" />}
                            {zone.status === 'pending' && <XCircle className="h-3 w-3 mr-1" />}
                            {zone.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {zone.workers} workers
                          </span>
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {zone.exit}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Est. {zone.time}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Assembly: {zone.assemblyPoint}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // In real implementation: Show evacuation map
                  alert('Evacuation map would be displayed here');
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View Evacuation Map
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // In real implementation: Send broadcast message
                  alert('Broadcast message sent to all workers');
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Broadcast Message
              </Button>
              <Button 
                variant="outline"
                className="border-gray-700 text-gray-300"
                onClick={handleEmergencyDeactivation}
              >
                Deactivate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
