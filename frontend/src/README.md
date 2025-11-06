# AI-Powered Construction Site Safety Intelligence System

A comprehensive dark-themed web dashboard that monitors construction sites in real-time to ensure compliance with Nordic safety standards.

## Features

### 🎥 Live Webcam Helmet Detection
- **Real-time AI detection** using TensorFlow.js and COCO-SSD
- Automatic person detection with bounding boxes
- **Instant alerts** when helmet/PPE is missing
- Visual feedback with confidence scores
- 5-second alert cooldown to prevent spam

### 🔔 Alert Management
- Real-time alert notifications with toast messages
- Alert lifecycle: Pending → Acknowledged → Resolved
- Filter alerts by status
- Detailed alert information with camera snapshots
- Delete and manage alerts

### 📊 Dashboard
- Live PPE compliance statistics
- Real-time camera feed status
- Environmental monitoring overview
- Weekly compliance trends
- Incident tracking by zone

### 🗺️ Zone Management
- Interactive site map with zone visualization
- Real-time environmental sensors (dust, noise, temperature, humidity)
- Risk index tracking per zone
- Worker count per zone

### 👷 Worker Profiles
- Individual worker safety tracking
- PPE compliance scores
- Activity history and certifications
- Alert history per worker

### 📈 Reports & Analytics
- Weekly/Monthly/Quarterly reports
- Compliance trend analysis
- Alert distribution charts
- Exportable reports

### 🌡️ Environment Monitoring
- Real-time sensor data across all zones
- 24-hour trend charts
- Dust, noise, temperature, humidity tracking
- Automatic threshold warnings

### 📋 Digital Permits & Training
- Work permit management
- Training progress tracking
- Certification status
- Expiry notifications

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Shadcn/ui** - Component library
- **TensorFlow.js** - AI/ML for person detection
- **COCO-SSD** - Object detection model
- **Recharts** - Data visualization
- **Sonner** - Toast notifications

## Getting Started

1. **Login**: Click any role button (Admin/Supervisor/Worker)
2. **Navigate**: Use the sidebar to explore different sections
3. **Start Webcam**: Go to "Live Monitoring" and click "Start Webcam"
4. **Test Detection**: The system will detect persons and alert if no helmet is present
5. **Manage Alerts**: View and manage alerts in the "Alerts & Incidents" page

## Key Components

### WebcamDetection Component
Located at `/components/WebcamDetection.tsx`
- Manages webcam access
- Runs detection every 2 seconds
- Draws bounding boxes on detected objects
- Generates alerts automatically

### AppContext
Located at `/context/AppContext.tsx`
- Global state management
- Alert management functions
- Worker and zone data
- Camera feed tracking

### Helmet Detection Service
Located at `/services/helmetDetection.ts`
- TensorFlow.js integration
- Person detection logic
- Confidence scoring

## Dark Theme

The application uses a professional Nordic-inspired dark theme:
- Background: `#0A0A0A`
- Safety Orange: `#FF7A00`
- Steel Blue: `#3A4E7A`
- Complementary grays for UI elements

## Production Notes

For production deployment:

1. **Custom PPE Detection Model**: Replace the simulated helmet detection with a custom-trained YOLO or TensorFlow model specifically trained on helmet/PPE datasets
2. **Backend Integration**: Connect to a real backend API for data persistence
3. **Camera Streams**: Integrate with actual RTSP/IP camera feeds
4. **Authentication**: Implement proper user authentication
5. **Database**: Use a proper database for alerts, workers, and zones
6. **Real-time Updates**: Implement WebSocket connections for live updates
7. **Privacy Compliance**: Ensure GDPR/privacy compliance for video recording

## Browser Support

- Modern browsers with WebRTC support
- Camera permissions required
- Tested on Chrome, Firefox, Safari, Edge

## License

MIT License
