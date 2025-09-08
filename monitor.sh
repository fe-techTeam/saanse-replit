#!/bin/bash

# SAANSE Server Monitoring Script
# This script monitors the server status, API endpoints, and system resources

echo "🚀 SAANSE Server Monitor"
echo "================================"
echo "Started at: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if server is running
check_server() {
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server Status: RUNNING${NC}"
        return 0
    else
        echo -e "${RED}❌ Server Status: NOT RUNNING${NC}"
        return 1
    fi
}

# Function to check API endpoints
check_api() {
    echo -e "${BLUE}📡 API Endpoints Check:${NC}"
    
    # Check videos API
    if curl -s http://localhost:3000/api/videos > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ /api/videos - OK${NC}"
    else
        echo -e "  ${RED}❌ /api/videos - FAILED${NC}"
    fi
    
    # Check admin API (should return auth error, which means it's working)
    if curl -s http://localhost:3000/api/admin/dashboard | grep -q "authentication"; then
        echo -e "  ${GREEN}✅ /api/admin/dashboard - OK (Auth working)${NC}"
    else
        echo -e "  ${RED}❌ /api/admin/dashboard - FAILED${NC}"
    fi
}

# Function to check system resources
check_resources() {
    echo -e "${BLUE}💻 System Resources:${NC}"
    
    # Get server process
    SERVER_PID=$(ps aux | grep "tsx server/index.ts" | grep -v grep | awk '{print $2}')
    
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "  ${GREEN}✅ Server Process: PID $SERVER_PID${NC}"
        
        # Get CPU and Memory usage
        CPU_USAGE=$(ps -p $SERVER_PID -o %cpu --no-headers 2>/dev/null)
        MEM_USAGE=$(ps -p $SERVER_PID -o %mem --no-headers 2>/dev/null)
        
        if [ ! -z "$CPU_USAGE" ]; then
            echo -e "  📊 CPU Usage: ${CPU_USAGE}%"
        fi
        
        if [ ! -z "$MEM_USAGE" ]; then
            echo -e "  📊 Memory Usage: ${MEM_USAGE}%"
        fi
    else
        echo -e "  ${RED}❌ Server Process: NOT FOUND${NC}"
    fi
    
    # Check port usage
    if lsof -i :3000 > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Port 3000: IN USE${NC}"
    else
        echo -e "  ${RED}❌ Port 3000: NOT IN USE${NC}"
    fi
}

# Function to check database connectivity
check_database() {
    echo -e "${BLUE}🗄️  Database Check:${NC}"
    
    # Try to get videos from API to test database
    VIDEO_COUNT=$(curl -s http://localhost:3000/api/videos | jq length 2>/dev/null)
    
    if [ ! -z "$VIDEO_COUNT" ] && [ "$VIDEO_COUNT" -ge 0 ]; then
        echo -e "  ${GREEN}✅ Database: CONNECTED (${VIDEO_COUNT} videos)${NC}"
    else
        echo -e "  ${RED}❌ Database: CONNECTION FAILED${NC}"
    fi
}

# Function to check frontend
check_frontend() {
    echo -e "${BLUE}🌐 Frontend Check:${NC}"
    
    if curl -s http://localhost:3000/ | grep -q "SAANSE"; then
        echo -e "  ${GREEN}✅ Main Page: LOADING${NC}"
    else
        echo -e "  ${RED}❌ Main Page: FAILED${NC}"
    fi
}

# Function to show recent logs
show_logs() {
    echo -e "${BLUE}📋 Recent Activity:${NC}"
    
    # Get server process and check if it's still running
    SERVER_PID=$(ps aux | grep "tsx server/index.ts" | grep -v grep | awk '{print $2}')
    
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "  ${GREEN}✅ Server is running (PID: $SERVER_PID)${NC}"
        echo -e "  🕐 Uptime: $(ps -p $SERVER_PID -o etime --no-headers 2>/dev/null)"
    else
        echo -e "  ${RED}❌ Server process not found${NC}"
    fi
}

# Main monitoring loop
monitor_loop() {
    while true; do
        clear
        echo "🚀 SAANSE Server Monitor"
        echo "================================"
        echo "Last updated: $(date)"
        echo ""
        
        check_server
        echo ""
        
        if [ $? -eq 0 ]; then
            check_api
            echo ""
            check_resources
            echo ""
            check_database
            echo ""
            check_frontend
            echo ""
            show_logs
        fi
        
        echo ""
        echo "Press Ctrl+C to stop monitoring"
        echo "Refreshing in 10 seconds..."
        
        sleep 10
    done
}

# Check if jq is installed for JSON parsing
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: jq not installed. Install with 'brew install jq' for better monitoring.${NC}"
    echo ""
fi

# Start monitoring
monitor_loop
