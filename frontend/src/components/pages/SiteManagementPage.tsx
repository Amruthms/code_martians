import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ZoneManagement } from './ZoneManagement';
import { EnvironmentMonitoring } from './EnvironmentMonitoring';
import { SiteMap } from './SiteMap';
import { Map, Layers, Radio } from 'lucide-react';

export function SiteManagementPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Site Management</h1>
        <p className="text-gray-400">Manage zones, environmental sensors, and site heat maps</p>
      </div>

      <Tabs defaultValue="sitemap" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-gray-900 border border-gray-800">
          <TabsTrigger 
            value="sitemap" 
            className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white"
          >
            <Map className="mr-2 h-4 w-4" />
            Site Map & Heat Zones
          </TabsTrigger>
          <TabsTrigger 
            value="zones" 
            className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white"
          >
            <Layers className="mr-2 h-4 w-4" />
            Zone Management
          </TabsTrigger>
          <TabsTrigger 
            value="sensors" 
            className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white"
          >
            <Radio className="mr-2 h-4 w-4" />
            Environmental Sensors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sitemap" className="mt-6">
          <SiteMap />
        </TabsContent>

        <TabsContent value="zones" className="mt-6">
          <ZoneManagement />
        </TabsContent>

        <TabsContent value="sensors" className="mt-6">
          <EnvironmentMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}
