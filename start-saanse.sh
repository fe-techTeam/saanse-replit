#!/bin/bash

# 🚀 SAANSE Platform - Quick Start Script
# This script handles everything: cleanup, build, and start

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="SAANSE Platform"
PORT=3000
NGROK_PORT=4040

# Command line options
SKIP_NGROK_PROMPT=false
FORCE_NGROK=false

# Function to print colored output
print_header() {
    echo -e "${PURPLE}🚀 $APP_NAME - Quick Start Script${NC}"
    echo "=============================================="
    echo
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific port
kill_port() {
    local port=$1
    local process_name=$2
    
    if check_port $port; then
        print_warning "Port $port is in use. Killing existing processes..."
        
        # Get PIDs using the port
        local pids=$(lsof -ti :$port)
        
        if [ ! -z "$pids" ]; then
            print_status "Killing processes on port $port: $pids"
            echo $pids | xargs kill -9 2>/dev/null || true
            sleep 2
            
            # Double check
            if check_port $port; then
                print_warning "Some processes still using port $port. Force killing..."
                sudo lsof -ti :$port | xargs sudo kill -9 2>/dev/null || true
                sleep 1
            fi
            
            print_success "Port $port cleared"
        fi
    else
        print_status "Port $port is free"
    fi
}

# Function to stop Docker containers
stop_docker_containers() {
    print_status "Stopping existing Docker containers..."
    
    # Stop docker-compose if running
    if [ -f "docker-compose.yml" ]; then
        docker-compose down 2>/dev/null || true
    fi
    
    # Stop any containers with saanse in the name
    local containers=$(docker ps -q --filter "name=saanse")
    if [ ! -z "$containers" ]; then
        print_status "Stopping SAANSE containers: $containers"
        echo $containers | xargs docker stop 2>/dev/null || true
        echo $containers | xargs docker rm 2>/dev/null || true
    fi
    
    print_success "Docker containers stopped"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_tools+=("docker-compose")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_status "Please install the missing tools and try again."
        exit 1
    fi
    
    print_success "All prerequisites are available"
}

# Function to create .env file if it doesn't exist
setup_env_file() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating with placeholder values..."
        
        cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
BASE_URL=http://localhost:3000

# Placeholder values - replace with your actual Supabase credentials
SUPABASE_URL=https://placeholder.supabase.co
SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role_key
VITE_SUPABASE_PUBLISHABLE_KEY=placeholder_anon_key

# Optional
DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/saanse
EOF
        
        print_warning "Created .env with placeholder values. Please update with your actual Supabase credentials."
    else
        print_status ".env file found"
    fi
}

# Function to parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-ngrok)
                SKIP_NGROK_PROMPT=true
                FORCE_NGROK=false
                shift
                ;;
            --with-ngrok)
                SKIP_NGROK_PROMPT=true
                FORCE_NGROK=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --no-ngrok     Start without ngrok tunnel (local only)"
    echo "  --with-ngrok   Start with ngrok tunnel (skip prompt)"
    echo "  -h, --help     Show this help message"
    echo
    echo "Examples:"
    echo "  $0              # Interactive mode (asks about ngrok)"
    echo "  $0 --no-ngrok   # Local only, no public access"
    echo "  $0 --with-ngrok # Public access, no prompt"
}

# Function to ask user about ngrok
ask_ngrok() {
    if [ "$SKIP_NGROK_PROMPT" = true ]; then
        return $([ "$FORCE_NGROK" = true ] && echo 0 || echo 1)
    fi
    
    echo
    print_status "Do you want to start ngrok tunnel for public access? (y/n)"
    read -p "Enter your choice [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0  # User wants ngrok
    else
        return 1  # User doesn't want ngrok
    fi
}

# Function to start ngrok tunnel
start_ngrok() {
    print_status "Starting ngrok tunnel..."
    
    # Kill existing ngrok processes
    pkill -f "ngrok.*3000" 2>/dev/null || true
    sleep 1
    
    # Start ngrok in background
    nohup ngrok http 3000 --log=stdout > ngrok.log 2>&1 &
    local ngrok_pid=$!
    
    # Wait for ngrok to start
    sleep 3
    
    # Get the public URL
    local public_url=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null || echo "")
    
    if [ ! -z "$public_url" ] && [ "$public_url" != "null" ]; then
        print_success "ngrok tunnel started: $public_url"
        echo "🌐 Public URL: $public_url"
    else
        print_warning "ngrok started but couldn't get public URL. Check ngrok.log for details."
    fi
}

# Function to show status
show_status() {
    echo
    print_success "🎉 $APP_NAME is now running!"
    echo
    print_status "Local URLs:"
    echo "  • Application: http://localhost:$PORT"
    echo "  • Health Check: http://localhost:$PORT/api/health"
    
    # Check if ngrok is running
    if lsof -Pi :$NGROK_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        local public_url=$(curl -s http://localhost:$NGROK_PORT/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null || echo "")
        if [ ! -z "$public_url" ] && [ "$public_url" != "null" ]; then
            echo "  • Public URL: $public_url"
        fi
        echo "  • ngrok Dashboard: http://localhost:$NGROK_PORT"
    else
        echo "  • Public access: Not enabled (ngrok not running)"
    fi
    echo
    print_status "Docker Status:"
    docker ps --filter "name=saanse" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo
    print_status "Useful Commands:"
    echo "  • View logs: docker-compose logs -f"
    echo "  • Stop all: ./stop-saanse.sh"
    echo "  • Restart: ./start-saanse.sh"
    if lsof -Pi :$NGROK_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  • View ngrok logs: tail -f ngrok.log"
    fi
    echo
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    # Don't kill ngrok here as user might want to keep it running
    print_success "Cleanup complete"
}

# Set up signal handlers
trap cleanup EXIT

# Main execution
main() {
    # Parse command line arguments
    parse_arguments "$@"
    
    print_header
    
    # Check prerequisites
    check_prerequisites
    
    # Kill existing processes
    print_status "Cleaning up existing processes..."
    kill_port $PORT "SAANSE App"
    kill_port $NGROK_PORT "ngrok"
    
    # Stop Docker containers
    stop_docker_containers
    
    # Setup environment
    setup_env_file
    
    # Build and start with Docker Compose
    print_status "Building and starting Docker containers..."
    docker-compose up --build -d
    
    # Wait for app to be ready
    print_status "Waiting for application to start..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:$PORT/api/health >/dev/null 2>&1; then
            print_success "Application is ready!"
            break
        fi
        
        attempt=$((attempt + 1))
        print_status "Waiting... (attempt $attempt/$max_attempts)"
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Application failed to start within expected time"
        print_status "Check logs with: docker-compose logs"
        exit 1
    fi
    
    # Ask user about ngrok tunnel
    if ask_ngrok; then
        start_ngrok
    else
        print_status "Skipping ngrok tunnel. App will only be accessible locally."
    fi
    
    # Show final status
    show_status
}

# Run main function
main "$@"
