// Example Node.js server to receive sensor data
// Install dependencies: npm install express body-parser cors

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Store data in memory (for demo purposes)
let sensorDataHistory = [];

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'sensor_logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Endpoint to receive sensor data
app.post('/api/sensor-data', (req, res) => {
  const sensorData = req.body;
  
  console.log('==== NEW REQUEST ====');
  console.log('Time:', new Date().toISOString());
  console.log('From IP:', req.ip, req.connection.remoteAddress);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Received sensor data:', JSON.stringify(sensorData, null, 2));
  
  // Add to history
  sensorDataHistory.push(sensorData);
  
  // Keep only last 1000 entries
  if (sensorDataHistory.length > 1000) {
    sensorDataHistory.shift();
  }
  
  // Save to file (optional)
  const filename = path.join(logsDir, `sensor_data_${Date.now()}.json`);
  fs.writeFileSync(filename, JSON.stringify(sensorData, null, 2));
  
  res.status(200).json({ 
    success: true, 
    message: 'Sensor data received',
    timestamp: new Date().toISOString()
  });
});

// Endpoint to receive batch data
app.post('/api/sensor-data/batch', (req, res) => {
  const batchData = req.body.batch || [];
  
  console.log(`Received ${batchData.length} sensor data entries`);
  
  batchData.forEach(data => {
    sensorDataHistory.push(data);
  });
  
  // Keep only last 1000 entries
  if (sensorDataHistory.length > 1000) {
    sensorDataHistory = sensorDataHistory.slice(-1000);
  }
  
  res.status(200).json({ 
    success: true, 
    message: `${batchData.length} entries received`,
    timestamp: new Date().toISOString()
  });
});

// Get latest sensor data
app.get('/api/sensor-data/latest', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const latest = sensorDataHistory.slice(-count);
  res.json(latest);
});

// Get all sensor data
app.get('/api/sensor-data/all', (req, res) => {
  res.json(sensorDataHistory);
});

// Clear history
app.delete('/api/sensor-data', (req, res) => {
  sensorDataHistory = [];
  res.json({ success: true, message: 'History cleared' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    entriesStored: sensorDataHistory.length,
    timestamp: new Date().toISOString()
  });
});

// Serve a simple dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sensor Data Dashboard</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 20px;
          background: #f5f5f5;
        }
        h1 { color: #333; }
        .card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-value { font-size: 2em; font-weight: bold; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
        pre {
          background: #f4f4f4;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
        }
        button {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px;
        }
        button:hover { background: #764ba2; }
        #latest-data { max-height: 400px; overflow-y: auto; }
      </style>
    </head>
    <body>
      <h1>📱 Sensor Data Dashboard</h1>
      
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value" id="total-count">0</div>
          <div class="stat-label">Total Entries</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="last-update">Never</div>
          <div class="stat-label">Last Update</div>
        </div>
      </div>

      <div class="card">
        <h2>Controls</h2>
        <button onclick="refresh()">🔄 Refresh</button>
        <button onclick="clearHistory()">🗑️ Clear History</button>
        <button onclick="downloadData()">💾 Download Data</button>
      </div>

      <div class="card">
        <h2>Latest Sensor Data</h2>
        <div id="latest-data"></div>
      </div>

      <script>
        function refresh() {
          fetch('/api/sensor-data/latest?count=5')
            .then(r => r.json())
            .then(data => {
              document.getElementById('latest-data').innerHTML = 
                '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
              
              if (data.length > 0) {
                const lastTime = new Date(data[data.length - 1].timestamp);
                document.getElementById('last-update').textContent = 
                  lastTime.toLocaleTimeString();
              }
            });

          fetch('/health')
            .then(r => r.json())
            .then(data => {
              document.getElementById('total-count').textContent = 
                data.entriesStored;
            });
        }

        function clearHistory() {
          if (confirm('Clear all sensor data history?')) {
            fetch('/api/sensor-data', { method: 'DELETE' })
              .then(() => refresh());
          }
        }

        function downloadData() {
          fetch('/api/sensor-data/all')
            .then(r => r.json())
            .then(data => {
              const blob = new Blob([JSON.stringify(data, null, 2)], 
                { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sensor_data_' + Date.now() + '.json';
              a.click();
            });
        }

        // Auto refresh every 2 seconds
        setInterval(refresh, 2000);
        refresh();
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sensor data server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/sensor-data`);
  console.log(`🌐 Access from phone: http://172.21.2.212:${PORT}`);
});
