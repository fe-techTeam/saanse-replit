#!/bin/bash

# 🛑 SAANSE Platform - Stop Script
# This script stops all SAANSE related processes

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🛑 Stopping SAANSE Platform..."
echo "=============================="
echo

# Stop Docker containers
print_status "Stopping Docker containers..."
docker-compose down 2>/dev/null || true

# Stop ngrok
print_status "Stopping ngrok tunnel..."
pkill -f "ngrok.*3000" 2>/dev/null || true

# Kill processes on port 3000
print_status "Clearing port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    print_success "Port 3000 cleared"
else
    print_status "Port 3000 is already free"
fi

# Kill processes on port 4040 (ngrok dashboard)
print_status "Clearing port 4040..."
if lsof -Pi :4040 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti :4040 | xargs kill -9 2>/dev/null || true
    print_success "Port 4040 cleared"
else
    print_status "Port 4040 is already free"
fi

print_success "🎉 SAANSE Platform stopped successfully!"
echo
print_status "All processes have been terminated."
