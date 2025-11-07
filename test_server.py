#!/usr/bin/env python3
"""
Simple test server to verify phone connectivity
Run this instead of the full backend to test if the issue is network-related
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Test server is running!", "status": "ok"}

@app.get("/stats")
async def stats():
    return {"test": "success", "server": "running"}

@app.post("/api/sensor-data")
async def receive_sensor_data(data: dict):
    print(f"✅ RECEIVED DATA FROM PHONE: {data}")
    return {"status": "success", "message": "Data received!", "data": data}

if __name__ == "__main__":
    print("=" * 60)
    print("🔥 SIMPLE TEST SERVER")
    print("=" * 60)
    print("")
    print("✓ No YOLO model loading")
    print("✓ Lightweight and fast")
    print("✓ Perfect for testing phone connectivity")
    print("")
    print("📱 Configure your phone with:")
    print("   http://10.130.181.39:8000/api/sensor-data")
    print("")
    print("=" * 60)
    print("")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
