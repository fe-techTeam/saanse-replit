#!/bin/bash

# 🧪 Test Script for ngrok Options
# This script demonstrates the different ways to run start-saanse.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}🧪 Testing ngrok Options in start-saanse.sh${NC}"
    echo "=============================================="
    echo
}

print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_header

echo "This script demonstrates the different ways to run start-saanse.sh:"
echo
echo "1. Interactive mode (asks about ngrok):"
print_test "./start-saanse.sh"
echo "   - Will prompt: 'Do you want to start ngrok tunnel for public access? (y/n)'"
echo "   - You can choose y or n"
echo

echo "2. Local only mode (no ngrok):"
print_test "./start-saanse.sh --no-ngrok"
echo "   - Skips ngrok completely"
echo "   - App only accessible at http://localhost:3000"
echo

echo "3. Public access mode (with ngrok):"
print_test "./start-saanse.sh --with-ngrok"
echo "   - Automatically starts ngrok"
echo "   - No prompt, just starts with public URL"
echo

echo "4. Help mode:"
print_test "./start-saanse.sh --help"
echo "   - Shows usage information"
echo

print_success "Choose any of these options to test your SAANSE platform!"
echo
print_test "Try running: ./start-saanse.sh --help"
