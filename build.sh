#!/usr/bin/env bash
# exit on error
set -o errexit

echo "==> Installing Python backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Building React Vite frontend static assets..."
cd frontend
npm install
npm run build
cd ..

echo "==> Initializing SQLite database & seed records..."
python -m backend.seed

echo "==> SafeSense production single-service build successful!"
