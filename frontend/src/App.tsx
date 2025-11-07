import { useState, useEffect } from "react";
import { AppProvider } from "./context/AppContext";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/pages/LoginPage";
import { Dashboard } from "./components/pages/Dashboard";
import { LiveMonitoring } from "./components/pages/LiveMonitoring";
import { AlertsIncidents } from "./components/pages/AlertsIncidents";
import { ZoneManagement } from "./components/pages/ZoneManagement";
import { WorkerProfile } from "./components/pages/WorkerProfile";
import { DigitalPermits } from "./components/pages/DigitalPermits";
import { ReportsPage } from "./components/pages/ReportsPage";
import { EnvironmentMonitoring } from "./components/pages/EnvironmentMonitoring";
import { SettingsPage } from "./components/pages/SettingsPage";
import { ESGAnalytics } from "./components/pages/ESGAnalytics";
import { TrainingGamification } from "./components/pages/TrainingGamification";
import { AdvancedFeatures } from "./components/pages/AdvancedFeatures";
import { SiteManagementPage } from "./components/pages/SiteManagementPage";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Force dark theme
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "live-monitoring":
        return <LiveMonitoring />;
      case "alerts":
        return <AlertsIncidents />;
      case "zones":
        return <ZoneManagement />;
      case "site-management":
        return <SiteManagementPage />;
      case "reports":
        return <ReportsPage />;
      case "permits":
        return <DigitalPermits />;
      case "environment":
        return <EnvironmentMonitoring />;
      case "workers":
        return <WorkerProfile />;
      case "training":
        return <TrainingGamification />;
      case "advanced":
        return <AdvancedFeatures />;
      case "esg":
        return <ESGAnalytics />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster position="top-right" theme="dark" />
    </AppProvider>
  );
}