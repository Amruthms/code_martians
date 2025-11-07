#!/usr/bin/env sh
set -e

MODEL_SRC="/app/best.pt"
MODEL_DST_DIR="/models"
MODEL_DST="$MODEL_DST_DIR/best.pt"

echo "[model-service] Starting model copy script"
if [ ! -f "$MODEL_SRC" ]; then
  echo "[model-service] ERROR: packaged model not found at $MODEL_SRC"
  exit 1
fi

mkdir -p "$MODEL_DST_DIR"
cp -f "$MODEL_SRC" "$MODEL_DST"
echo "[model-service] Copied model to $MODEL_DST"

echo "[model-service] Sleeping to keep container alive (model populated into volume)"
tail -f /dev/null
