import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  Download,
  Plus,
  Award
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const permits = [
  {
    id: 1,
    type: 'Hot Work Permit',
    zone: 'Level 2 - West',
    issuedTo: 'Erik Andersen',
    issuedBy: 'Supervisor Anna',
    validUntil: 'Nov 6, 2025 - 5:00 PM',
    status: 'active',
  },
  {
    id: 2,
    type: 'Confined Space Entry',
    zone: 'Basement - Tank Room',
    issuedTo: 'Maria Johansson',
    issuedBy: 'Safety Officer Lars',
    validUntil: 'Nov 6, 2025 - 3:30 PM',
    status: 'active',
  },
  {
    id: 3,
    type: 'Height Work Permit',
    zone: 'Roof - West',
    issuedTo: 'Lars Nielsen',
    issuedBy: 'Supervisor Anna',
    validUntil: 'Nov 5, 2025 - 6:00 PM',
    status: 'expired',
  },
];

const trainings = [
  { name: 'Fall Protection', completion: 100, status: 'completed' },
  { name: 'Confined Space', completion: 100, status: 'completed' },
  { name: 'First Aid Basics', completion: 75, status: 'in-progress' },
  { name: 'Fire Safety', completion: 0, status: 'not-started' },
];

export function DigitalPermits() {
  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white mb-2">Training & Permits</h2>
          <p className="text-sm text-gray-400">Manage work permits and training certifications</p>
        </div>
        <Button className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90">
          <Plus className="h-4 w-4 mr-2" />
          New Permit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Active Permits</div>
                <div className="mt-1 text-2xl text-white">
                  {permits.filter(p => p.status === 'active').length}
                </div>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Expired Today</div>
                <div className="mt-1 text-2xl text-red-400">
                  {permits.filter(p => p.status === 'expired').length}
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
                <div className="text-sm text-gray-400">Certifications</div>
                <div className="mt-1 text-2xl text-white">24</div>
              </div>
              <Award className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">In Training</div>
                <div className="mt-1 text-2xl text-yellow-400">3</div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="permits" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="permits" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Work Permits</TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="permits">
          <div className="grid gap-4">
            {permits.map((permit) => (
              <Card key={permit.id} className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white">{permit.type}</h3>
                        <Badge
                          variant="outline"
                          className={permit.status === 'active' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}
                        >
                          {permit.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Zone</div>
                          <div className="text-white mt-1">{permit.zone}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Issued To</div>
                          <div className="text-white mt-1">{permit.issuedTo}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Issued By</div>
                          <div className="text-white mt-1">{permit.issuedBy}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Valid Until</div>
                          <div className="text-white mt-1">{permit.validUntil}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training">
          <div className="grid gap-4">
            {trainings.map((training, idx) => (
              <Card key={idx} className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white">{training.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        training.status === 'completed' ? 'border-green-500 text-green-400' :
                        training.status === 'in-progress' ? 'border-yellow-500 text-yellow-400' :
                        'border-gray-500 text-gray-400'
                      }
                    >
                      {training.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF7A00] transition-all"
                        style={{ width: `${training.completion}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{training.completion}% Complete</span>
                      {training.status === 'in-progress' && (
                        <Button size="sm" variant="ghost" className="h-auto p-0 text-[#FF7A00] hover:text-[#FF7A00]/80 hover:bg-transparent">
                          Continue →
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
