import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  GraduationCap,
  Award,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Star,
  Zap,
  Shield,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, AvatarFallback } from '../ui/avatar';

const availableBadges = [
  { id: 'helmet-hero', name: 'Helmet Hero', description: '30 days perfect helmet compliance', icon: '🪖', requirement: '30 days 100% helmet usage' },
  { id: 'safety-star', name: 'Safety Star', description: 'Zero violations for 60 days', icon: '⭐', requirement: 'No violations for 60 consecutive days' },
  { id: 'training-champion', name: 'Training Champion', description: 'Completed all training modules', icon: '🏆', requirement: 'Complete all 3 core training modules' },
  { id: 'quick-responder', name: 'Quick Responder', description: 'Fast incident response', icon: '⚡', requirement: 'Respond to 5 incidents within 2 minutes' },
  { id: 'glove-guardian', name: 'Glove Guardian', description: 'Perfect glove compliance', icon: '🧤', requirement: '14 days 100% glove usage' },
  { id: 'mentor-badge', name: 'Safety Mentor', description: 'Trained 3 new workers', icon: '👨‍🏫', requirement: 'Complete mentorship of 3 workers' },
];

const allTrainingModules = [
  { id: 1, name: 'Site Safety Induction', duration: 15, description: 'Essential safety rules and site layout', difficulty: 'Beginner', videoLength: '12 min' },
  { id: 2, name: 'PPE Usage & Maintenance', duration: 10, description: 'Proper equipment usage and care', difficulty: 'Beginner', videoLength: '8 min' },
  { id: 3, name: 'Emergency Procedures', duration: 20, description: 'Fire, evacuation, and first aid', difficulty: 'Intermediate', videoLength: '15 min' },
  { id: 4, name: 'Working at Heights', duration: 25, description: 'Fall protection and harness safety', difficulty: 'Advanced', videoLength: '20 min' },
  { id: 5, name: 'Machinery Operation Safety', duration: 30, description: 'Crane, forklift, and equipment safety', difficulty: 'Advanced', videoLength: '25 min' },
  { id: 6, name: 'Hazardous Materials Handling', duration: 20, description: 'Chemical safety and spill response', difficulty: 'Intermediate', videoLength: '18 min' },
];

export function TrainingGamification() {
  const { workers, awardBadge } = useApp();
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<typeof allTrainingModules[0] | null>(null);

  const topPerformers = [...workers].sort((a, b) => (b.safetyScore || 0) - (a.safetyScore || 0)).slice(0, 5);
  
  const overallStats = {
    totalModulesCompleted: workers.flatMap(w => w.trainingModules).filter(m => m.completed).length,
    totalModules: workers.flatMap(w => w.trainingModules).length,
    averageScore: Math.round(
      workers.flatMap(w => w.trainingModules).filter(m => m.completed && m.score).reduce((acc, m) => acc + (m.score || 0), 0) /
      workers.flatMap(w => w.trainingModules).filter(m => m.completed && m.score).length
    ),
    totalBadgesEarned: workers.flatMap(w => w.badges).length,
  };

  const selectedWorkerData = workers.find(w => w.id === selectedWorker);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-900/50 text-green-400 border-0';
      case 'Intermediate': return 'bg-yellow-900/50 text-yellow-400 border-0';
      case 'Advanced': return 'bg-red-900/50 text-red-400 border-0';
      default: return 'bg-gray-900/50 text-gray-400 border-0';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl text-white mb-2">Training & Gamification Hub</h2>
        <p className="text-sm text-gray-400">Worker development, achievements & safety culture</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Training Completion</CardTitle>
            <GraduationCap className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">
              {overallStats.totalModulesCompleted}/{overallStats.totalModules}
            </div>
            <Progress 
              value={(overallStats.totalModulesCompleted / overallStats.totalModules) * 100} 
              className="h-2 bg-gray-800" 
            />
            <p className="text-xs text-gray-400 mt-2">
              {Math.round((overallStats.totalModulesCompleted / overallStats.totalModules) * 100)}% complete
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Average Score</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">{overallStats.averageScore}%</div>
            <Badge className="bg-green-900/50 text-green-400 border-0">Excellent</Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">{overallStats.totalBadgesEarned}</div>
            <p className="text-xs text-gray-400">Across {workers.length} workers</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-300">Active Learners</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white mb-1">{workers.length}</div>
            <Badge className="bg-blue-900/50 text-blue-400 border-0">All Enrolled</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Training & Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Available Training Modules */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Training Library</CardTitle>
              <CardDescription className="text-gray-400">Available courses for safety certification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {allTrainingModules.map((module) => (
                <div 
                  key={module.id}
                  className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedModule(module);
                    setTrainingDialogOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="h-4 w-4 text-blue-400" />
                        <span className="text-white">{module.name}</span>
                        <Badge className={getDifficultyColor(module.difficulty)}>{module.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{module.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.videoLength}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Quiz: {module.duration} min
                        </span>
                      </div>
                    </div>
                    <Button size="sm" style={{ backgroundColor: '#3A4E7A' }} className="text-white">
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-gradient-to-br from-yellow-900/20 to-gray-900 border-yellow-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-white">Safety Champions Leaderboard</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Top 5 performers this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPerformers.map((worker, index) => (
                <div 
                  key={worker.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    index === 0 ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-gray-800'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {index === 0 ? '🏆' : index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-700 text-white">{worker.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-white">{worker.name}</div>
                    <div className="text-xs text-gray-400">{worker.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">{worker.safetyScore}</div>
                    <div className="text-xs text-gray-400">Safety Score</div>
                  </div>
                  <div className="flex gap-1">
                    {worker.badges.slice(0, 3).map((badge) => (
                      <div key={badge.id} className="text-lg" title={badge.name}>{badge.icon}</div>
                    ))}
                    {worker.badges.length > 3 && (
                      <div className="text-xs text-gray-400">+{worker.badges.length - 3}</div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Worker Progress Table */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Worker Training Progress</CardTitle>
              <CardDescription className="text-gray-400">Individual completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workers.map((worker) => {
                  const completed = worker.trainingModules.filter(m => m.completed).length;
                  const total = worker.trainingModules.length;
                  const percentage = Math.round((completed / total) * 100);
                  
                  return (
                    <div 
                      key={worker.id}
                      className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                      onClick={() => setSelectedWorker(worker.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gray-700 text-white">{worker.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-white mb-1">{worker.name}</div>
                        <Progress value={percentage} className="h-2 bg-gray-700" />
                      </div>
                      <div className="text-right">
                        <div className="text-white">{completed}/{total}</div>
                        <div className="text-xs text-gray-400">{percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Badges & Achievements */}
        <div className="space-y-6">
          {/* Badge Gallery */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-white">Achievement Badges</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Earn badges for safety excellence</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {availableBadges.map((badge) => {
                const earnedCount = workers.filter(w => w.badges.some(b => b.id === badge.id)).length;
                
                return (
                  <div 
                    key={badge.id}
                    className="p-3 bg-gray-800 rounded-lg text-center hover:bg-gray-750 transition-colors"
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="text-sm text-white mb-1">{badge.name}</div>
                    <div className="text-xs text-gray-400 mb-2">{badge.description}</div>
                    <Badge className="bg-blue-900/50 text-blue-400 border-0 text-xs">
                      {earnedCount} earned
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Badge Requirements */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">How to Earn Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableBadges.slice(0, 4).map((badge) => (
                <div key={badge.id} className="flex gap-3 p-2">
                  <div className="text-2xl flex-shrink-0">{badge.icon}</div>
                  <div>
                    <div className="text-sm text-white">{badge.name}</div>
                    <div className="text-xs text-gray-400">{badge.requirement}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-blue-900/30 to-gray-900 border-blue-800">
            <CardHeader>
              <CardTitle className="text-white">Motivation Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <TrendingUp className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <span className="text-green-400">23% increase</span> in PPE compliance since badge program launch
                </p>
              </div>
              <div className="flex gap-2">
                <Star className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <span className="text-yellow-400">4 workers</span> competing for "Safety Star of the Month"
                </p>
              </div>
              <div className="flex gap-2">
                <Zap className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  Training completion rate up <span className="text-blue-400">45%</span> with gamification
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Training Module Dialog */}
      <Dialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedModule?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">{selectedModule?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <Play className="h-16 w-16 text-gray-600" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <Clock className="h-5 w-5 text-blue-400 mb-1" />
                <div className="text-sm text-gray-400">Duration</div>
                <div className="text-white">{selectedModule?.videoLength}</div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <Target className="h-5 w-5 text-green-400 mb-1" />
                <div className="text-sm text-gray-400">Quiz Time</div>
                <div className="text-white">{selectedModule?.duration} min</div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <Star className="h-5 w-5 text-yellow-400 mb-1" />
                <div className="text-sm text-gray-400">Difficulty</div>
                <div className="text-white">{selectedModule?.difficulty}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" style={{ backgroundColor: '#3A4E7A' }}>
                <Play className="h-4 w-4 mr-2" />
                Start Training
              </Button>
              <Button variant="outline" className="border-gray-700 text-gray-300" onClick={() => setTrainingDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Worker Detail Dialog */}
      {selectedWorkerData && (
        <Dialog open={selectedWorker !== null} onOpenChange={() => setSelectedWorker(null)}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gray-700 text-white text-lg">{selectedWorkerData.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div>{selectedWorkerData.name}</div>
                  <div className="text-sm text-gray-400">{selectedWorkerData.role}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Badges */}
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Earned Badges ({selectedWorkerData.badges.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkerData.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <div className="text-sm text-white">{badge.name}</div>
                        <div className="text-xs text-gray-400">Earned {badge.earnedDate}</div>
                      </div>
                    </div>
                  ))}
                  {selectedWorkerData.badges.length === 0 && (
                    <div className="text-sm text-gray-500">No badges earned yet</div>
                  )}
                </div>
              </div>

              {/* Training Progress */}
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Training Modules</h3>
                <div className="space-y-2">
                  {selectedWorkerData.trainingModules.map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        {module.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-600" />
                        )}
                        <div>
                          <div className="text-sm text-white">{module.name}</div>
                          <div className="text-xs text-gray-400">{module.duration} min</div>
                        </div>
                      </div>
                      {module.completed && module.score && (
                        <Badge className="bg-green-900/50 text-green-400 border-0">
                          Score: {module.score}%
                        </Badge>
                      )}
                      {!module.completed && (
                        <Button size="sm" variant="outline" className="border-gray-700 text-gray-300">
                          Start
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
