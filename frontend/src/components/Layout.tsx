import { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Video, 
  AlertTriangle, 
  Map, 
  FileText, 
  GraduationCap, 
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Users,
  Leaf,
  Trophy,
  Brain,
  MapPin,
  Smartphone
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'live-monitoring', label: 'Live Monitoring', icon: Video },
  { id: 'alerts', label: 'Alerts & Incidents', icon: AlertTriangle },
  { id: 'zones', label: 'Zones & Sensors', icon: Map },
  { id: 'site-management', label: 'Site Management', icon: MapPin },
  { id: 'sensor-data', label: 'Mobile Sensors', icon: Smartphone },
  { id: 'workers', label: 'Workers', icon: Users },
  { id: 'training', label: 'Training & Badges', icon: Trophy },
  { id: 'advanced', label: 'Advanced Features', icon: Brain },
  { id: 'esg', label: 'ESG Analytics', icon: Leaf },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'permits', label: 'Digital Permits', icon: GraduationCap },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Layout({ children, currentPage, onNavigate, onLogout }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { alerts } = useApp();
  
  const pendingAlerts = alerts.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0A0A0A]/95 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#FF7A00' }}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-white">AI Safety System</div>
                <div className="text-xs text-gray-400">Oslo Central Site</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right text-sm">
              <div className="text-gray-400">Thursday, November 6, 2025</div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-white hover:bg-gray-800"
              onClick={() => onNavigate('alerts')}
            >
              <Bell className="h-5 w-5" />
              {pendingAlerts > 0 && (
                <Badge 
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  style={{ backgroundColor: '#FF7A00', color: 'white' }}
                >
                  {pendingAlerts}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-white hover:bg-gray-800">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback style={{ backgroundColor: '#3A4E7A', color: 'white' }}>
                      AS
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">Admin Supervisor</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
                <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="text-gray-300 focus:bg-gray-800 focus:text-white">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-gray-300 focus:bg-gray-800 focus:text-white"
                  onClick={() => onNavigate('settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem onClick={onLogout} className="text-gray-300 focus:bg-gray-800 focus:text-white">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r border-gray-800 bg-[#0A0A0A]
          transition-transform duration-300 lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <nav className="flex flex-col gap-1 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors
                    ${isActive 
                      ? 'text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                  style={isActive ? { backgroundColor: '#FF7A00' } : {}}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.id === 'alerts' && pendingAlerts > 0 && !isActive && (
                    <Badge 
                      className="ml-auto h-5 px-2 text-xs"
                      style={{ backgroundColor: '#FF7A00', color: 'white' }}
                    >
                      {pendingAlerts}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 top-16 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
