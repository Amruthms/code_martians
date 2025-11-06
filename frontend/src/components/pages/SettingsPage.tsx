import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function SettingsPage() {
  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A]">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-white mb-2">Settings</h2>
        <p className="text-sm text-gray-400">Configure system preferences and notifications</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Alerts</TabsTrigger>
          <TabsTrigger value="detection" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Detection</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Site Information</CardTitle>
                <CardDescription className="text-gray-400">Basic site configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name" className="text-gray-300">Site Name</Label>
                  <Input
                    id="site-name"
                    defaultValue="Oslo Central Construction Site"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-location" className="text-gray-300">Location</Label>
                  <Input
                    id="site-location"
                    defaultValue="Oslo, Norway"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                  <Select defaultValue="cet">
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="cet">Central European Time (CET)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Data Retention</CardTitle>
                <CardDescription className="text-gray-400">Configure how long data is stored</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-retention" className="text-gray-300">Video Retention (days)</Label>
                  <Input
                    id="video-retention"
                    type="number"
                    defaultValue="30"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alert-retention" className="text-gray-300">Alert Retention (days)</Label>
                  <Input
                    id="alert-retention"
                    type="number"
                    defaultValue="90"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90">Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Alert Notifications</CardTitle>
              <CardDescription className="text-gray-400">Configure when and how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Email Notifications</div>
                  <div className="text-sm text-gray-400">Receive alerts via email</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">SMS Notifications</div>
                  <div className="text-sm text-gray-400">Receive critical alerts via SMS</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Push Notifications</div>
                  <div className="text-sm text-gray-400">Browser push notifications</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Sound Alerts</div>
                  <div className="text-sm text-gray-400">Play sound for new alerts</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-4 border-t border-gray-800">
                <Label htmlFor="alert-threshold" className="text-gray-300">Alert Severity Threshold</Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="low">Low and above</SelectItem>
                    <SelectItem value="medium">Medium and above</SelectItem>
                    <SelectItem value="high">High and Critical only</SelectItem>
                    <SelectItem value="critical">Critical only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detection">
          <div className="space-y-6">
            <Card className="bg-blue-950/30 border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-300">📹 Camera Permissions Required</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-200 space-y-2">
                <p>For live webcam detection to work, you need to allow camera access in your browser.</p>
                <p className="text-xs text-blue-300">
                  <strong>How to enable:</strong>
                </p>
                <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside ml-2">
                  <li>Click the camera icon (🎥) or lock icon (🔒) in your browser's address bar</li>
                  <li>Find "Camera" in the permissions list</li>
                  <li>Select "Allow" or "Always allow on this site"</li>
                  <li>Refresh the page after changing permissions</li>
                </ul>
                <p className="text-xs text-blue-300 mt-3">
                  <strong>Note:</strong> Camera access is only used for real-time safety monitoring and is never recorded without your consent.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">AI Detection Settings</CardTitle>
                <CardDescription className="text-gray-400">Configure PPE detection parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="confidence" className="text-gray-300">Confidence Threshold (%)</Label>
                  <Input
                    id="confidence"
                    type="number"
                    defaultValue="85"
                    min="0"
                    max="100"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400">Minimum confidence level for PPE detection</p>
                </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Helmet Detection</div>
                  <div className="text-sm text-gray-400">Enable helmet/hard hat detection</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Safety Vest Detection</div>
                  <div className="text-sm text-gray-400">Enable high-visibility vest detection</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white">Harness Detection</div>
                  <div className="text-sm text-gray-400">Enable fall protection harness detection</div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scan-interval" className="text-gray-300">Scan Interval (seconds)</Label>
                <Input
                  id="scan-interval"
                  type="number"
                  defaultValue="2"
                  min="1"
                  max="60"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400">How often to run detection on camera feeds</p>
              </div>

              <Button className="bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90">Save Settings</Button>
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription className="text-gray-400">Manage system users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white">Admin Supervisor</div>
                    <div className="text-sm text-gray-400">admin@example.com • Administrator</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white">Anna Bergström</div>
                    <div className="text-sm text-gray-400">anna@example.com • Supervisor</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white">Lars Nielsen</div>
                    <div className="text-sm text-gray-400">lars@example.com • Safety Officer</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">Edit</Button>
                </div>
              </div>
              <Button className="mt-4 bg-[#FF7A00] text-white hover:bg-[#FF7A00]/90">Add New User</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
