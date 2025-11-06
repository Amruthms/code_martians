import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

export interface Alert {
  id: number;
  time: string;
  date: string;
  zone: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'resolved';
  assignedTo: string;
  worker: string;
  confidence: number;
  isNearMiss?: boolean;
  aiGeneratedReport?: string;
}

export interface NearMiss {
  id: number;
  time: string;
  date: string;
  zone: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  worker: string;
  preventedIncident: string;
}

export interface WeatherData {
  condition: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  alerts: string[];
  icon: string;
}

export interface RiskForecast {
  zone: string;
  riskLevel: 'low' | 'medium' | 'high';
  probability: number;
  factors: string[];
  recommendations: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedDate: string;
}

export interface TrainingModule {
  id: number;
  name: string;
  duration: number;
  completed: boolean;
  score?: number;
  completedDate?: string;
}

export interface Worker {
  id: number;
  name: string;
  role: string;
  zone: string;
  ppeScore: number;
  lastAlert: string;
  status: 'active' | 'warning' | 'offline';
  initials: string;
  safetyScore?: number;
  badges: Badge[];
  trainingModules: TrainingModule[];
  gamificationPoints?: number;
  preferredLanguage?: string;
}

export interface Zone {
  id: number;
  name: string;
  status: 'safe' | 'restricted' | 'danger';
  workers: number;
  riskIndex: number;
  dust: number;
  noise: number;
  temp: number;
  position: { x: number; y: number; width: number; height: number };
  nearMissCount?: number;
  riskForecast?: RiskForecast;
}

export interface CameraFeed {
  id: number;
  zone: string;
  workers: number;
  alerts: string[];
  status: 'safe' | 'warning' | 'danger';
  streamActive?: boolean;
}

export interface ESGMetric {
  category: 'environmental' | 'social' | 'governance';
  metric: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

interface AppContextType {
  alerts: Alert[];
  workers: Worker[];
  zones: Zone[];
  cameraFeeds: CameraFeed[];
  esgMetrics: ESGMetric[];
  safetyScore: number;
  nearMisses: NearMiss[];
  weatherData: WeatherData | null;
  offlineMode: boolean;
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  updateAlertStatus: (id: number, status: Alert['status']) => void;
  deleteAlert: (id: number) => void;
  updateWorker: (id: number, updates: Partial<Worker>) => void;
  updateZone: (id: number, updates: Partial<Zone>) => void;
  updateCameraFeed: (id: number, updates: Partial<CameraFeed>) => void;
  awardBadge: (workerId: number, badgeId: string, badgeName: string, icon: string) => void;
  addNearMiss: (nearMiss: Omit<NearMiss, 'id'>) => void;
  awardPoints: (workerId: number, points: number, reason: string) => void;
  webcamEnabled: boolean;
  setWebcamEnabled: (enabled: boolean) => void;
  setOfflineMode: (offline: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      zone: 'Level 2 - West',
      type: 'Helmet Missing',
      severity: 'high',
      status: 'pending',
      assignedTo: 'Supervisor Anna',
      worker: 'Worker #12',
      confidence: 96,
    },
  ]);

  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: 12,
      name: 'Erik Andersen',
      role: 'Construction Worker',
      zone: 'Level 2 - West',
      ppeScore: 87,
      lastAlert: '2 hours ago',
      status: 'active',
      initials: 'EA',
      safetyScore: 87,
      gamificationPoints: 1250,
      preferredLanguage: 'en',
      badges: [
        { id: 'helmet-hero', name: 'Helmet Hero', icon: '🪖', earnedDate: 'Oct 15, 2025' },
      ],
      trainingModules: [
        { id: 1, name: 'Site Safety Induction', duration: 15, completed: true, score: 95, completedDate: 'Sep 10, 2025' },
        { id: 2, name: 'PPE Usage & Maintenance', duration: 10, completed: true, score: 92, completedDate: 'Sep 12, 2025' },
        { id: 3, name: 'Emergency Procedures', duration: 20, completed: false },
      ],
    },
    {
      id: 7,
      name: 'Maria Johansson',
      role: 'Site Engineer',
      zone: 'Level 1 - East',
      ppeScore: 96,
      lastAlert: '1 day ago',
      status: 'active',
      initials: 'MJ',
      safetyScore: 96,
      gamificationPoints: 2850,
      preferredLanguage: 'sv',
      badges: [
        { id: 'safety-star', name: 'Safety Star', icon: '⭐', earnedDate: 'Oct 20, 2025' },
        { id: 'training-champion', name: 'Training Champion', icon: '🏆', earnedDate: 'Oct 25, 2025' },
      ],
      trainingModules: [
        { id: 1, name: 'Site Safety Induction', duration: 15, completed: true, score: 98, completedDate: 'Aug 5, 2025' },
        { id: 2, name: 'PPE Usage & Maintenance', duration: 10, completed: true, score: 95, completedDate: 'Aug 7, 2025' },
        { id: 3, name: 'Emergency Procedures', duration: 20, completed: true, score: 97, completedDate: 'Aug 10, 2025' },
      ],
    },
    {
      id: 23,
      name: 'Lars Nielsen',
      role: 'Scaffold Worker',
      zone: 'Roof - West',
      ppeScore: 72,
      lastAlert: '30 min ago',
      status: 'warning',
      initials: 'LN',
      safetyScore: 72,
      gamificationPoints: 580,
      preferredLanguage: 'da',
      badges: [],
      trainingModules: [
        { id: 1, name: 'Site Safety Induction', duration: 15, completed: true, score: 85, completedDate: 'Sep 20, 2025' },
        { id: 2, name: 'PPE Usage & Maintenance', duration: 10, completed: false },
        { id: 3, name: 'Emergency Procedures', duration: 20, completed: false },
      ],
    },
    {
      id: 45,
      name: 'Anna Bergström',
      role: 'Safety Supervisor',
      zone: 'Ground Floor',
      ppeScore: 99,
      lastAlert: 'Never',
      status: 'active',
      initials: 'AB',
      safetyScore: 99,
      gamificationPoints: 4200,
      preferredLanguage: 'en',
      badges: [
        { id: 'safety-star', name: 'Safety Star', icon: '⭐', earnedDate: 'Sep 1, 2025' },
        { id: 'training-champion', name: 'Training Champion', icon: '🏆', earnedDate: 'Sep 5, 2025' },
        { id: 'mentor-badge', name: 'Safety Mentor', icon: '👨‍🏫', earnedDate: 'Oct 1, 2025' },
        { id: 'quick-responder', name: 'Quick Responder', icon: '⚡', earnedDate: 'Oct 10, 2025' },
      ],
      trainingModules: [
        { id: 1, name: 'Site Safety Induction', duration: 15, completed: true, score: 100, completedDate: 'Jul 1, 2025' },
        { id: 2, name: 'PPE Usage & Maintenance', duration: 10, completed: true, score: 98, completedDate: 'Jul 3, 2025' },
        { id: 3, name: 'Emergency Procedures', duration: 20, completed: true, score: 99, completedDate: 'Jul 5, 2025' },
      ],
    },
  ]);

  const [zones, setZones] = useState<Zone[]>([
    {
      id: 1,
      name: 'Level 1 - East',
      status: 'safe',
      workers: 3,
      riskIndex: 12,
      dust: 45,
      noise: 72,
      temp: 18,
      position: { x: 20, y: 20, width: 25, height: 20 },
      nearMissCount: 2,
      riskForecast: {
        zone: 'Level 1 - East',
        riskLevel: 'low',
        probability: 15,
        factors: ['Good PPE compliance', 'Low incident history'],
        recommendations: ['Continue current safety practices'],
      },
    },
    {
      id: 2,
      name: 'Level 1 - West',
      status: 'restricted',
      workers: 2,
      riskIndex: 35,
      dust: 120,
      noise: 85,
      temp: 22,
      position: { x: 50, y: 20, width: 25, height: 20 },
      nearMissCount: 5,
      riskForecast: {
        zone: 'Level 1 - West',
        riskLevel: 'medium',
        probability: 42,
        factors: ['High dust levels', 'Above threshold noise'],
        recommendations: ['Enhanced respiratory protection', 'Limit exposure time'],
      },
    },
    {
      id: 3,
      name: 'Level 2 - North',
      status: 'safe',
      workers: 5,
      riskIndex: 18,
      dust: 62,
      noise: 68,
      temp: 16,
      position: { x: 20, y: 45, width: 25, height: 20 },
      nearMissCount: 1,
      riskForecast: {
        zone: 'Level 2 - North',
        riskLevel: 'low',
        probability: 20,
        factors: ['Moderate environmental conditions'],
        recommendations: ['Maintain vigilance during peak hours'],
      },
    },
    {
      id: 4,
      name: 'Roof - West',
      status: 'danger',
      workers: 1,
      riskIndex: 78,
      dust: 35,
      noise: 65,
      temp: 12,
      position: { x: 50, y: 45, width: 25, height: 20 },
      nearMissCount: 8,
      riskForecast: {
        zone: 'Roof - West',
        riskLevel: 'high',
        probability: 78,
        factors: ['Working at heights', 'Weather exposure', 'Recent near-misses'],
        recommendations: ['Mandatory safety harness check', 'Buddy system required', 'Monitor weather conditions'],
      },
    },
    {
      id: 5,
      name: 'Ground Floor',
      status: 'safe',
      workers: 6,
      riskIndex: 8,
      dust: 28,
      noise: 58,
      temp: 20,
      position: { x: 20, y: 70, width: 55, height: 15 },
      nearMissCount: 0,
      riskForecast: {
        zone: 'Ground Floor',
        riskLevel: 'low',
        probability: 8,
        factors: ['Optimal conditions', 'High compliance rate'],
        recommendations: ['Standard safety protocols'],
      },
    },
  ]);

  const [cameraFeeds, setCameraFeeds] = useState<CameraFeed[]>([
    { id: 1, zone: 'Level 1 - East', workers: 3, alerts: [], status: 'safe', streamActive: false },
    { id: 2, zone: 'Level 1 - West', workers: 2, alerts: [], status: 'safe', streamActive: false },
    { id: 3, zone: 'Level 2 - North', workers: 5, alerts: [], status: 'safe', streamActive: false },
    { id: 4, zone: 'Level 2 - South', workers: 4, alerts: [], status: 'safe', streamActive: false },
    { id: 5, zone: 'Roof - East', workers: 2, alerts: [], status: 'safe', streamActive: false },
    { id: 6, zone: 'Roof - West', workers: 1, alerts: [], status: 'safe', streamActive: false },
    { id: 7, zone: 'Ground Floor', workers: 6, alerts: [], status: 'safe', streamActive: false },
    { id: 8, zone: 'Parking Area', workers: 2, alerts: [], status: 'safe', streamActive: false },
    { id: 9, zone: 'Live Webcam', workers: 0, alerts: [], status: 'safe', streamActive: true },
  ]);

  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  // Near Misses
  const [nearMisses, setNearMisses] = useState<NearMiss[]>([
    {
      id: 1,
      time: '09:15 AM',
      date: 'Nov 5, 2025',
      zone: 'Roof - West',
      description: 'Falling object narrowly missed worker by 0.8m',
      severity: 'high',
      worker: 'Lars Nielsen',
      preventedIncident: 'Head injury from falling tool',
    },
    {
      id: 2,
      time: '02:30 PM',
      date: 'Nov 4, 2025',
      zone: 'Level 1 - West',
      description: 'Worker almost slipped on wet surface',
      severity: 'medium',
      worker: 'Erik Andersen',
      preventedIncident: 'Potential fall injury',
    },
  ]);

  // Weather Data (simulated - would come from API)
  const [weatherData] = useState<WeatherData>({
    condition: 'Partly Cloudy',
    temperature: 8,
    windSpeed: 25,
    humidity: 72,
    alerts: ['High wind warning - Crane operations restricted'],
    icon: '⛅',
  });

  // ESG Metrics
  const [esgMetrics] = useState<ESGMetric[]>([
    // Environmental
    { category: 'environmental', metric: 'CO₂ Emissions Reduced', value: 12.5, unit: ' tons', target: 15, trend: 'up' },
    { category: 'environmental', metric: 'Waste Recycled', value: 78, unit: '%', target: 85, trend: 'up' },
    { category: 'environmental', metric: 'Energy Efficiency', value: 82, unit: '%', target: 90, trend: 'stable' },
    // Social
    { category: 'social', metric: 'Worker Safety Index', value: 92, unit: '', target: 95, trend: 'up' },
    { category: 'social', metric: 'Training Hours', value: 245, unit: ' hrs', target: 300, trend: 'up' },
    { category: 'social', metric: 'Incident Reduction', value: 35, unit: '%', target: 40, trend: 'up' },
    // Governance
    { category: 'governance', metric: 'Compliance Rate', value: 98, unit: '%', target: 100, trend: 'up' },
    { category: 'governance', metric: 'Audit Score', value: 96, unit: '%', target: 95, trend: 'stable' },
  ]);

  // Calculate overall safety score
  const calculateSafetyScore = () => {
    // Multi-dimensional scoring
    const ppeCompliance = workers.reduce((sum, w) => sum + w.ppeScore, 0) / workers.length;
    const incidentRate = 100 - (alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length * 5);
    const trainingCompletion = (workers.flatMap(w => w.trainingModules).filter(m => m.completed).length / 
                                workers.flatMap(w => w.trainingModules).length) * 100;
    const environmentalSafety = 87; // Based on zone metrics
    const workerWellbeing = 71; // Based on health data
    
    // Weighted average
    const score = (
      ppeCompliance * 0.30 +
      incidentRate * 0.25 +
      trainingCompletion * 0.20 +
      environmentalSafety * 0.15 +
      workerWellbeing * 0.10
    );
    
    return Math.round(Math.min(100, Math.max(0, score)));
  };

  const [safetyScore, setSafetyScore] = useState(92);

  // Recalculate safety score when data changes
  useEffect(() => {
    const newScore = calculateSafetyScore();
    setSafetyScore(newScore);
  }, [alerts, workers, zones]);

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now(),
    };
    setAlerts(prev => [newAlert, ...prev]);
    
    // Show toast notification
    toast.error(`Safety Alert: ${alert.type}`, {
      description: `${alert.zone} - ${alert.worker}`,
      duration: 5000,
    });
  };

  const updateAlertStatus = (id: number, status: Alert['status']) => {
    setAlerts(prev =>
      prev.map(alert => {
        if (alert.id === id) {
          // Generate AI report when resolving
          if (status === 'resolved' && !alert.aiGeneratedReport) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const report = `At ${alert.time}, a ${alert.severity} severity incident occurred in ${alert.zone}. ${alert.type} was detected for ${alert.worker} with ${alert.confidence}% confidence. The alert was acknowledged and resolved at ${timeStr}. All safety protocols were followed and the situation was successfully contained.`;
            return { ...alert, status, aiGeneratedReport: report };
          }
          return { ...alert, status };
        }
        return alert;
      })
    );
    
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      toast.success(`Alert ${status}`, {
        description: `${alert.type} in ${alert.zone}`,
      });
      
      if (status === 'resolved') {
        toast.info('AI Report Generated', {
          description: 'Incident summary has been auto-generated',
        });
      }
    }
  };

  const deleteAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const updateWorker = (id: number, updates: Partial<Worker>) => {
    setWorkers(prev =>
      prev.map(worker =>
        worker.id === id ? { ...worker, ...updates } : worker
      )
    );
  };

  const updateZone = (id: number, updates: Partial<Zone>) => {
    setZones(prev =>
      prev.map(zone =>
        zone.id === id ? { ...zone, ...updates } : zone
      )
    );
  };

  const updateCameraFeed = (id: number, updates: Partial<CameraFeed>) => {
    setCameraFeeds(prev =>
      prev.map(feed =>
        feed.id === id ? { ...feed, ...updates } : feed
      )
    );
  };

  const awardBadge = (workerId: number, badgeId: string, badgeName: string, icon: string) => {
    setWorkers(prev =>
      prev.map(worker =>
        worker.id === workerId
          ? {
              ...worker,
              badges: [
                ...worker.badges,
                {
                  id: badgeId,
                  name: badgeName,
                  icon,
                  earnedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                },
              ],
            }
          : worker
      )
    );
    
    toast.success(`Badge Earned! 🏆`, {
      description: `${badgeName} awarded!`,
      duration: 5000,
    });
  };

  const addNearMiss = (nearMiss: Omit<NearMiss, 'id'>) => {
    const newNearMiss: NearMiss = {
      ...nearMiss,
      id: Date.now(),
    };
    setNearMisses(prev => [newNearMiss, ...prev]);
    
    // Update zone near-miss count
    const zone = zones.find(z => z.name === nearMiss.zone);
    if (zone) {
      updateZone(zone.id, { 
        nearMissCount: (zone.nearMissCount || 0) + 1 
      });
    }
    
    toast.warning('Near-Miss Detected', {
      description: `${nearMiss.description} in ${nearMiss.zone}`,
      duration: 5000,
    });
  };

  const awardPoints = (workerId: number, points: number, reason: string) => {
    setWorkers(prev =>
      prev.map(worker =>
        worker.id === workerId
          ? {
              ...worker,
              gamificationPoints: (worker.gamificationPoints || 0) + points,
            }
          : worker
      )
    );
    
    toast.success(`+${points} Safety Points! 🎯`, {
      description: reason,
      duration: 3000,
    });
  };

  return (
    <AppContext.Provider
      value={{
        alerts,
        workers,
        zones,
        cameraFeeds,
        esgMetrics,
        safetyScore,
        nearMisses,
        weatherData,
        offlineMode,
        addAlert,
        updateAlertStatus,
        deleteAlert,
        updateWorker,
        updateZone,
        updateCameraFeed,
        awardBadge,
        addNearMiss,
        awardPoints,
        webcamEnabled,
        setWebcamEnabled,
        setOfflineMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
