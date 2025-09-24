#!/bin/bash

# 🧪 SAANSE Platform - Quick Test Script
# This script demonstrates the start/stop functionality

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🧪 SAANSE Platform - Quick Test"
echo "==============================="
echo

# Test 1: Stop any existing processes
print_status "Test 1: Stopping existing processes..."
./stop-saanse.sh
echo

# Test 2: Start the platform
print_status "Test 2: Starting SAANSE platform..."
./start-saanse.sh
echo

# Test 3: Wait a moment and test health endpoint
print_status "Test 3: Testing health endpoint..."
sleep 5
if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
    print_success "Health check passed!"
    curl -s http://localhost:3000/api/health | jq .
else
    print_warning "Health check failed - app might still be starting"
fi
echo

# Test 4: Show running processes
print_status "Test 4: Showing running processes..."
echo "Docker containers:"
docker ps --filter "name=saanse" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo

echo "Processes on port 3000:"
lsof -i :3000 2>/dev/null || echo "No processes on port 3000"
echo

echo "Processes on port 4040 (ngrok):"
lsof -i :4040 2>/dev/null || echo "No processes on port 4040"
echo

print_success "🎉 Quick test completed!"
echo
print_status "Your SAANSE platform should now be running at:"
echo "  • Local: http://localhost:3000"
echo "  • Public: Check ngrok output above"
echo
print_status "To stop everything, run: ./stop-saanse.sh"
