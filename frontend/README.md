
  # 🎨 AI-Powered Construction Safety Dashboard

  Modern, responsive React dashboard for real-time construction site safety monitoring.

  ## Overview
  
  This dashboard is part of the AI-Powered Construction Site Safety Intelligence System.
  The original design is available at https://www.figma.com/design/5kHjpKlwPC4mTE8Hb7yZ7T/AI-Powered-Safety-Dashboard.

  ### Features
  - 📊 Real-time safety analytics and compliance scoring
  - 📹 Live camera feeds with AI-powered PPE detection
  - 🚨 Alert management and incident tracking
  - 👷 Worker profile and compliance history
  - 🗺️ Interactive zone management with site map
  - 📈 ESG analytics and reporting
  - 🎓 Training and gamification modules
  - 📋 Digital permit management
  - 🚑 Emergency evacuation guidance

  ## Tech Stack
  - **Framework**: React 18 + TypeScript
  - **Build Tool**: Vite
  - **Styling**: TailwindCSS
  - **UI Components**: Radix UI (shadcn/ui)
  - **Charts**: Recharts
  - **Icons**: Lucide React
  - **AI**: TensorFlow.js for in-browser detection
  - **State Management**: React Context API

  ## Setup

  ### Prerequisites
  - Node.js 18+
  - npm or yarn

  ### Installation

  ```bash
  # Install dependencies
  npm install

  # Copy environment file
  cp .env.example .env

  # Start development server
  npm run dev
  ```

  The app will be available at `http://localhost:5173`

  ### Build for Production

  ```bash
  # Build
  npm run build

  # Preview production build
  npm run preview
  ```

  ## Environment Variables

  Create a `.env` file:

  ```env
  VITE_API_URL=http://localhost:8000
  ```

  ## Project Structure

  ```
  src/
  ├── components/
  │   ├── pages/              # Main page components
  │   │   ├── Dashboard.tsx
  │   │   ├── LiveMonitoring.tsx
  │   │   ├── AlertsIncidents.tsx
  │   │   ├── WorkerProfile.tsx
  │   │   ├── ZoneManagement.tsx
  │   │   └── ...
  │   ├── ui/                 # Reusable UI components (shadcn)
  │   ├── figma/              # Figma-imported components
  │   ├── Layout.tsx          # App layout wrapper
  │   ├── WebcamDetection.tsx # Camera integration
  │   ├── DigitalTwinMap.tsx  # 3D site visualization
  │   └── VoiceAssistant.tsx  # Voice control
  ├── context/
  │   └── AppContext.tsx      # Global state management
  ├── services/
  │   ├── helmetDetection.ts  # TensorFlow.js detection
  │   └── pdfGenerator.ts     # Report generation
  ├── styles/
  │   └── globals.css         # Global styles
  ├── App.tsx                 # Main app component
  └── main.tsx               # Entry point
  ```

  ## Key Components

  ### Dashboard
  Main overview with safety KPIs, compliance scores, and quick actions.

  ### Live Monitoring
  Real-time camera feeds with AI-powered PPE detection overlays.

  ### Alerts & Incidents
  Comprehensive alert table with filtering, acknowledgment, and CAPA workflow.

  ### Worker Profile
  Individual worker tracking with compliance history and training records.

  ### Zone Management
  Interactive site map with safety zones, environmental sensors, and restrictions.

  ### Reports
  Analytics dashboard with trends, heatmaps, and PDF export functionality.

  ## Design System

  ### Colors
  - **Safety Orange**: `#FF7A00` - Primary actions, alerts
  - **Dark Gray**: `#1E1E1E` - Backgrounds, text
  - **Steel Blue**: `#3A4E7A` - Secondary elements
  - **White**: `#FFFFFF` - Content areas

  ### Typography
  - **Font**: Inter / Poppins
  - **Sizes**: Consistent scale with Tailwind defaults

  ### Components
  All UI components are built with Radix UI primitives for accessibility and consistency.

  ## API Integration

  The frontend communicates with the FastAPI backend at `http://localhost:8000`:

  ```typescript
  // Example: Fetching alerts
  const response = await fetch(`${import.meta.env.VITE_API_URL}/alerts`);
  const data = await response.json();
  ```

  ## Development

  ### Adding New Pages
  1. Create component in `src/components/pages/`
  2. Add route in `App.tsx`
  3. Update navigation in `Layout.tsx`

  ### Styling
  - Use Tailwind utility classes
  - Follow existing color scheme
  - Maintain responsive design

  ## Browser Support

  - Chrome/Edge (latest)
  - Firefox (latest)
  - Safari (latest)

  ## License

  Proprietary - Construction Safety Intelligence System

  