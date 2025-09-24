#!/bin/bash

# SAANSE Platform - Cleanup Script
# This script removes all Kubernetes resources and optionally stops Minikube

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to cleanup Kubernetes resources
cleanup_k8s() {
    print_status "Cleaning up Kubernetes resources..."
    
    # Delete resources in reverse order
    kubectl delete -f k8s/hpa.yaml --ignore-not-found=true
    kubectl delete -f k8s/ingress.yaml --ignore-not-found=true
    kubectl delete -f k8s/service.yaml --ignore-not-found=true
    kubectl delete -f k8s/deployment.yaml --ignore-not-found=true
    kubectl delete -f k8s/secret.yaml --ignore-not-found=true
    kubectl delete -f k8s/configmap.yaml --ignore-not-found=true
    kubectl delete -f k8s/namespace.yaml --ignore-not-found=true
    
    print_success "Kubernetes resources cleaned up."
}

# Function to remove Docker images
cleanup_docker() {
    print_status "Cleaning up Docker images..."
    
    # Use Minikube's Docker daemon
    eval $(minikube docker-env) 2>/dev/null || true
    
    # Remove SAANSE images
    docker rmi saanse:latest 2>/dev/null || print_warning "saanse:latest image not found"
    
    # Clean up dangling images
    docker image prune -f
    
    print_success "Docker images cleaned up."
}

# Function to remove /etc/hosts entry
cleanup_hosts() {
    print_status "Cleaning up /etc/hosts entry..."
    
    if grep -q "saanse.local" /etc/hosts; then
        print_status "Removing saanse.local from /etc/hosts (requires sudo)..."
        sudo sed -i '' '/saanse.local/d' /etc/hosts
        print_success "Removed saanse.local from /etc/hosts."
    else
        print_status "No saanse.local entry found in /etc/hosts."
    fi
}

# Function to stop Minikube
stop_minikube() {
    print_status "Do you want to stop Minikube? (y/n)"
    read -r stop_mk
    
    if [ "$stop_mk" = "y" ] || [ "$stop_mk" = "Y" ]; then
        print_status "Stopping Minikube..."
        minikube stop
        print_success "Minikube stopped."
        
        print_status "Do you want to delete Minikube cluster? (y/n)"
        read -r delete_mk
        
        if [ "$delete_mk" = "y" ] || [ "$delete_mk" = "Y" ]; then
            print_warning "This will permanently delete the Minikube cluster and all data."
            print_status "Are you sure? (y/n)"
            read -r confirm_delete
            
            if [ "$confirm_delete" = "y" ] || [ "$confirm_delete" = "Y" ]; then
                print_status "Deleting Minikube cluster..."
                minikube delete
                print_success "Minikube cluster deleted."
            fi
        fi
    fi
}

# Main function
main() {
    echo "🧹 SAANSE Platform - Cleanup Script"
    echo "===================================="
    echo
    
    print_warning "This script will remove all SAANSE Kubernetes resources."
    print_status "Do you want to continue? (y/n)"
    read -r confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        print_status "Cleanup cancelled."
        exit 0
    fi
    
    echo
    cleanup_k8s
    cleanup_docker
    cleanup_hosts
    stop_minikube
    
    echo
    print_success "🎉 Cleanup completed successfully!"
    print_status "All SAANSE resources have been removed."
}

# Run main function
main "$@"
