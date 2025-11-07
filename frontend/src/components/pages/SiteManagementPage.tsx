import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ZoneManagement } from '@/components/pages/ZoneManagement';
import { EnvironmentMonitoring } from '@/components/pages/EnvironmentMonitoring';
import { SiteMap } from '@/components/pages/SiteMap';
import { Map, Layers, Radio } from 'lucide-react';

export function SiteManagementPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-white tracking-tight">Site Management</h1>
        <p className="text-gray-400 text-lg">Manage zones, environmental sensors, and site heat maps</p>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="sitemap" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-3 bg-gray-900/50 border border-gray-800/50 p-1.5 rounded-xl">
          <TabsTrigger 
            value="sitemap" 
            className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all duration-200 rounded-lg font-medium py-3"
          >
            <Map className="mr-2 h-4 w-4" />
            Site Map & Heat Zones
          </TabsTrigger>
          <TabsTrigger 
            value="zones" 
            className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all duration-200 rounded-lg font-medium py-3"
          >
            <Layers className="mr-2 h-4 w-4" />
            Zone Management
          </TabsTrigger>
          <TabsTrigger 
            value="sensors" 
            className="data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all duration-200 rounded-lg font-medium py-3"
          >
            <Radio className="mr-2 h-4 w-4" />
            Environmental Sensors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sitemap" className="mt-8">
          <SiteMap />
        </TabsContent>

        <TabsContent value="zones" className="mt-8">
          <ZoneManagement />
        </TabsContent>

        <TabsContent value="sensors" className="mt-8">
          <EnvironmentMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}
