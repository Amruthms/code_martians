"""
Example Python Flask server to receive sensor data
Install dependencies: pip install flask flask-cors
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)

# Store data in memory
sensor_data_history = []

# Create logs directory
LOGS_DIR = 'sensor_logs'
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

@app.route('/api/sensor-data', methods=['POST'])
def receive_sensor_data():
    """Receive sensor data from the mobile app"""
    sensor_data = request.json
    
    print(f"Received sensor data: {json.dumps(sensor_data, indent=2)}")
    
    # Add to history
    sensor_data_history.append(sensor_data)
    
    # Keep only last 1000 entries
    if len(sensor_data_history) > 1000:
        sensor_data_history.pop(0)
    
    # Save to file (optional)
    filename = os.path.join(LOGS_DIR, f"sensor_data_{datetime.now().timestamp()}.json")
    with open(filename, 'w') as f:
        json.dump(sensor_data, f, indent=2)
    
    return jsonify({
        'success': True,
        'message': 'Sensor data received',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/sensor-data/batch', methods=['POST'])
def receive_batch_data():
    """Receive batch sensor data"""
    batch_data = request.json.get('batch', [])
    
    print(f"Received {len(batch_data)} sensor data entries")
    
    sensor_data_history.extend(batch_data)
    
    # Keep only last 1000 entries
    if len(sensor_data_history) > 1000:
        sensor_data_history[:] = sensor_data_history[-1000:]
    
    return jsonify({
        'success': True,
        'message': f'{len(batch_data)} entries received',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/sensor-data/latest', methods=['GET'])
def get_latest_data():
    """Get latest sensor data"""
    count = int(request.args.get('count', 10))
    latest = sensor_data_history[-count:] if sensor_data_history else []
    return jsonify(latest)

@app.route('/api/sensor-data/all', methods=['GET'])
def get_all_data():
    """Get all sensor data"""
    return jsonify(sensor_data_history)

@app.route('/api/sensor-data', methods=['DELETE'])
def clear_history():
    """Clear sensor data history"""
    sensor_data_history.clear()
    return jsonify({'success': True, 'message': 'History cleared'})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'entriesStored': len(sensor_data_history),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/')
def dashboard():
    """Serve dashboard"""
    html = """
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
    """
    return render_template_string(html)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    print(f"🚀 Sensor data server running on http://localhost:{port}")
    print(f"📊 Dashboard: http://localhost:{port}")
    print(f"📡 API endpoint: http://localhost:{port}/api/sensor-data")
    app.run(host='0.0.0.0', port=port, debug=True)
