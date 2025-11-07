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
import { toast } from 'sonner';

export function EmergencyEvacuation() {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [evacuationDialogOpen, setEvacuationDialogOpen] = useState(false);
  const [callingContact, setCallingContact] = useState<string | null>(null);

  const emergencyContacts = [
    { name: 'Fire Department', number: '110', type: 'fire', apiEndpoint: 'fire' },
    { name: 'Ambulance', number: '113', type: 'ambulance', apiEndpoint: 'ambulance' },
    { name: 'Police', number: '112', type: 'police', apiEndpoint: 'police' },
    { name: 'Site Manager', number: '+47 123 45 678', type: 'manager', apiEndpoint: 'manager' },
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

  const handleEmergencyCall = async (contactType: string, contactName: string) => {
    setCallingContact(contactType);
    
    try {
      console.log(`Initiating call to ${contactName} (${contactType})...`);
      
      const response = await fetch(`http://localhost:8000/voice/call/${contactType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        toast.success('Emergency Call Initiated! ✅', {
          description: `Successfully calling ${contactName}. The emergency service will receive a call shortly. Call SID: ${data.sid?.substring(0, 10)}...`,
          duration: 5000,
        });
      } else {
        throw new Error(data.detail || 'Failed to initiate call');
      }
    } catch (error) {
      console.error('Emergency call error:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Backend Not Running ❌', {
          description: 'Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000',
          duration: 7000,
        });
      } else {
        toast.error('Call Failed ❌', {
          description: error instanceof Error ? error.message : 'Unable to place emergency call. Please try again or contact emergency services directly.',
          duration: 6000,
        });
      }
    } finally {
      setCallingContact(null);
    }
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
                      onClick={() => handleEmergencyCall(contact.apiEndpoint, contact.name)}
                      disabled={callingContact === contact.apiEndpoint}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {callingContact === contact.apiEndpoint ? 'Calling...' : contact.number}
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
        <DialogContent className="bg-gray-900 border-red-600 text-white max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-3">
              <div className="h-10 w-10 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <Siren className="h-5 w-5" />
              </div>
              <div>
                <div>Emergency Evacuation Active</div>
                <div className="text-xs text-gray-400">Real-time evacuation monitoring</div>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Emergency evacuation status dashboard showing real-time progress, zone status, and emergency contacts
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            {/* Overall Progress */}
            <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg">
              <div className="mb-3">
                <div className="text-lg text-white mb-1">{evacuatedWorkers} of {totalWorkers} Workers Evacuated</div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-400">Evacuation Progress: {evacuationProgress}%</div>
                  <div className="text-2xl font-bold text-red-400">{evacuationProgress}%</div>
                </div>
              </div>
              <Progress value={evacuationProgress} className="h-3 bg-gray-800" />
            </div>

            {/* Emergency Contacts */}
            <div>
              <h3 className="text-white text-base mb-3">Emergency Services Notified</h3>
              <div className="grid grid-cols-2 gap-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-3 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{contact.name}</div>
                      <div className="text-xs text-gray-400">{contact.number}</div>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 ml-2 shrink-0"
                      onClick={() => handleEmergencyCall(contact.apiEndpoint, contact.name)}
                      disabled={callingContact === contact.apiEndpoint}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {callingContact === contact.apiEndpoint ? 'Calling...' : 'Call'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800">
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
                className="border-gray-700 text-gray-300 sm:flex-none"
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
