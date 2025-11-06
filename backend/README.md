# FastAPI Backend - Construction Safety API

## Overview
FastAPI-based REST API server that handles:
- Alert ingestion from vision system
- Real-time statistics and compliance scoring
- Alert history management
- Integration endpoints for frontend dashboard

## Setup

### Local Development

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Docker

```bash
# Build
docker build -t safety-backend .

# Run
docker run -p 8000:8000 safety-backend
```

## API Endpoints

### POST /alerts
Submit a new alert from the vision system.

**Request Body:**
```json
{
  "type": "no_helmet",
  "ts": 1699372800000,
  "zone": "Crane Area",
  "frame_path": "frames/alert_123.jpg",
  "meta": {
    "confidence": 0.95,
    "worker_id": "W001"
  }
}
```

### GET /alerts?since={timestamp}
Retrieve alerts, optionally filtered by timestamp.

**Response:**
```json
{
  "data": [
    {
      "type": "no_helmet",
      "ts": 1699372800000,
      "zone": "Crane Area",
      "frame_path": "frames/alert_123.jpg",
      "meta": {}
    }
  ]
}
```

### GET /stats
Get overall safety statistics and compliance score.

**Response:**
```json
{
  "total": 150,
  "by_type": {
    "no_helmet": 45,
    "no_vest": 30,
    "zone_intrusion": 25
  },
  "safety_score": 85
}
```

## Configuration

Environment variables:
- `BACKEND_HOST` - Host to bind (default: 0.0.0.0)
- `BACKEND_PORT` - Port to listen (default: 8000)
- `CORS_ORIGINS` - Allowed CORS origins

## Features

- ✅ Fast async API with FastAPI
- ✅ Pydantic validation
- ✅ CORS enabled for frontend
- ✅ Automatic API documentation (Swagger UI)
- ✅ Alert history with size limits
- ✅ Real-time safety scoring

## API Documentation

When running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] WebSocket support for real-time updates
- [ ] Advanced analytics and ML predictions
- [ ] Multi-site support
- [ ] Alert prioritization and routing
