#!/bin/bash

# SAANSE Platform - Build and Deploy Script for Minikube
# This script builds the Docker image and deploys to Minikube with Ingress

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v minikube &> /dev/null; then
        print_error "Minikube is not installed. Please install Minikube first."
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    print_success "All prerequisites are installed."
}

# Start Minikube if not running
start_minikube() {
    print_status "Checking Minikube status..."
    
    if ! minikube status &> /dev/null; then
        print_status "Starting Minikube..."
        minikube start --driver=docker --cpus=4 --memory=4096
        print_success "Minikube started successfully."
    else
        print_success "Minikube is already running."
    fi
    
    # Enable required addons
    print_status "Enabling Minikube addons..."
    minikube addons enable ingress
    minikube addons enable metrics-server
    print_success "Addons enabled."
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    
    # Use Minikube's Docker daemon
    eval $(minikube docker-env)
    
    # Build the image
    docker build -t saanse:latest .
    
    print_success "Docker image built successfully."
}

# Deploy to Kubernetes
deploy_to_k8s() {
    print_status "Deploying to Kubernetes..."
    
    # Apply Kubernetes manifests in order
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secret.yaml
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/service.yaml
    kubectl apply -f k8s/ingress.yaml
    kubectl apply -f k8s/hpa.yaml
    
    print_success "Kubernetes manifests applied."
}

# Wait for deployment to be ready
wait_for_deployment() {
    print_status "Waiting for deployment to be ready..."
    
    kubectl wait --for=condition=available --timeout=300s deployment/saanse-app -n saanse
    
    print_success "Deployment is ready."
}

# Setup local DNS
setup_local_dns() {
    print_status "Setting up local DNS..."
    
    # Get Minikube IP
    MINIKUBE_IP=$(minikube ip)
    
    # Check if entry already exists in /etc/hosts
    if grep -q "saanse.local" /etc/hosts; then
        print_warning "saanse.local already exists in /etc/hosts. Please update manually if needed."
        print_status "Current entry: $(grep saanse.local /etc/hosts)"
    else
        print_status "Adding saanse.local to /etc/hosts (requires sudo)..."
        echo "$MINIKUBE_IP saanse.local" | sudo tee -a /etc/hosts
        print_success "Added saanse.local to /etc/hosts."
    fi
    
    print_status "Minikube IP: $MINIKUBE_IP"
}

# Display deployment information
show_deployment_info() {
    print_success "Deployment completed successfully!"
    echo
    print_status "Deployment Information:"
    echo "  Application URL: http://saanse.local"
    echo "  Minikube IP: $(minikube ip)"
    echo "  Namespace: saanse"
    echo
    print_status "Useful Commands:"
    echo "  View pods: kubectl get pods -n saanse"
    echo "  View services: kubectl get services -n saanse"
    echo "  View ingress: kubectl get ingress -n saanse"
    echo "  View logs: kubectl logs -f deployment/saanse-app -n saanse"
    echo "  Scale deployment: kubectl scale deployment saanse-app --replicas=3 -n saanse"
    echo
    print_status "Minikube Commands:"
    echo "  Open dashboard: minikube dashboard"
    echo "  Stop Minikube: minikube stop"
    echo "  Delete Minikube: minikube delete"
}

# Main execution
main() {
    echo "🚀 SAANSE Platform - Build and Deploy Script"
    echo "=============================================="
    echo
    
    check_prerequisites
    start_minikube
    build_image
    deploy_to_k8s
    wait_for_deployment
    setup_local_dns
    show_deployment_info
    
    echo
    print_success "🎉 SAANSE Platform is now running on Minikube!"
    print_status "Access your application at: http://saanse.local"
}

# Run main function
main "$@"
