import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner@2.0.3';

interface VoiceCommand {
  command: string;
  action: () => void;
  keywords: string[];
}

export function VoiceAssistant() {
  const { alerts, zones, addAlert, updateAlertStatus, addNearMiss } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  const voiceCommands: VoiceCommand[] = [
    {
      command: 'Report incident in [zone]',
      keywords: ['report', 'incident'],
      action: () => {
        const zoneMatch = transcript.match(/in\s+([\w\s-]+)/i);
        if (zoneMatch) {
          const zoneName = zoneMatch[1].trim();
          const zone = zones.find(z => z.name.toLowerCase().includes(zoneName.toLowerCase()));
          if (zone) {
            addAlert({
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              zone: zone.name,
              type: 'Voice Reported Incident',
              severity: 'medium',
              status: 'pending',
              assignedTo: 'Safety Supervisor',
              worker: 'Voice Report',
              confidence: 100,
            });
            speak(`Incident reported in ${zone.name}`);
          }
        }
      },
    },
    {
      command: 'Show unacknowledged alerts',
      keywords: ['show', 'unacknowledged', 'alerts'],
      action: () => {
        const pending = alerts.filter(a => a.status === 'pending');
        speak(`There are ${pending.length} unacknowledged alerts`);
        toast.info('Unacknowledged Alerts', {
          description: `${pending.length} alerts pending review`,
        });
      },
    },
    {
      command: 'Zone status',
      keywords: ['zone', 'status'],
      action: () => {
        const safeZones = zones.filter(z => z.status === 'safe').length;
        const dangerZones = zones.filter(z => z.status === 'danger').length;
        speak(`${safeZones} zones are safe, ${dangerZones} zones need attention`);
      },
    },
    {
      command: 'Acknowledge alert',
      keywords: ['acknowledge', 'alert'],
      action: () => {
        const pending = alerts.find(a => a.status === 'pending');
        if (pending) {
          updateAlertStatus(pending.id, 'acknowledged');
          speak('Alert acknowledged');
        } else {
          speak('No pending alerts to acknowledge');
        }
      },
    },
    {
      command: 'High risk zones',
      keywords: ['high', 'risk', 'zones'],
      action: () => {
        const highRisk = zones.filter(z => z.riskIndex > 50);
        if (highRisk.length > 0) {
          speak(`High risk zones: ${highRisk.map(z => z.name).join(', ')}`);
        } else {
          speak('All zones have acceptable risk levels');
        }
      },
    },
  ];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        processCommand(speechResult);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error('Voice Recognition Error', {
            description: 'Please try again',
          });
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const processCommand = (speech: string) => {
    const lowerSpeech = speech.toLowerCase();
    setLastCommand(speech);

    for (const cmd of voiceCommands) {
      const matchCount = cmd.keywords.filter(keyword => 
        lowerSpeech.includes(keyword.toLowerCase())
      ).length;

      if (matchCount >= 2) {
        cmd.action();
        return;
      }
    }

    speak("Command not recognized. Please try again.");
    toast.warning('Command Not Recognized', {
      description: 'Try: "Show unacknowledged alerts" or "Report incident in Zone A"',
    });
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Voice Recognition Not Supported', {
        description: 'Your browser does not support voice commands',
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      setTranscript('');
      toast.info('Listening...', {
        description: 'Say "Hey SafeBot" followed by your command',
      });
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-blue-400" />
              Voice Assistant (SafeBot)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Hands-free safety command center
            </CardDescription>
          </div>
          <Badge 
            className={isListening ? 'bg-red-900/50 text-red-400 border-0 animate-pulse' : 'bg-gray-800 text-gray-400 border-0'}
          >
            {isListening ? 'Listening...' : 'Ready'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={toggleListening}
            className={
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white w-32 h-32 rounded-full'
                : 'bg-blue-600 hover:bg-blue-700 text-white w-32 h-32 rounded-full'
            }
          >
            {isListening ? (
              <MicOff className="h-12 w-12" />
            ) : (
              <Mic className="h-12 w-12" />
            )}
          </Button>
        </div>

        {transcript && (
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">You said:</div>
            <div className="text-white">{transcript}</div>
          </div>
        )}

        {lastCommand && (
          <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="text-xs text-blue-400 mb-1">Last command:</div>
            <div className="text-blue-300 text-sm">{lastCommand}</div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm text-gray-300">Available Commands:</div>
          <div className="grid gap-2">
            {voiceCommands.map((cmd, idx) => (
              <div key={idx} className="text-xs text-gray-400 p-2 bg-gray-800 rounded">
                "{cmd.command}"
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
