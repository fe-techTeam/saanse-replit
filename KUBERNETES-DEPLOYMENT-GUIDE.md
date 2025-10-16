# 🚀 SAANSE Platform - Kubernetes Deployment Guide

This comprehensive guide walks you through containerizing and deploying the SAANSE platform using Docker, Minikube, and Kubernetes with Ingress.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Docker Containerization](#docker-containerization)
4. [Kubernetes Manifests](#kubernetes-manifests)
5. [Minikube Setup](#minikube-setup)
6. [Deployment Process](#deployment-process)
7. [Best Practices Explained](#best-practices-explained)
8. [Troubleshooting](#troubleshooting)
9. [Production Considerations](#production-considerations)

## 🔧 Prerequisites

Before starting, ensure you have the following installed:

### Required Tools
```bash
# Docker
brew install docker

# Minikube
brew install minikube

# kubectl
brew install kubectl

# Optional: Helm (for advanced deployments)
brew install helm
```

### System Requirements
- **CPU**: 4+ cores recommended
- **Memory**: 8GB+ RAM
- **Disk**: 20GB+ free space
- **OS**: macOS, Linux, or Windows with WSL2

## 🏗️ Architecture Overview

### Application Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   Supabase DB   │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 3000    │    │   External      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Kubernetes Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Minikube Cluster                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │     Ingress     │  │   ConfigMap     │  │    Secret    │ │
│  │  (nginx-ingress)│  │ (Non-sensitive) │  │ (Sensitive)  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│           │                     │                  │        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │    Service      │  │   Deployment    │  │     HPA      │ │
│  │  (ClusterIP)    │  │  (2+ replicas)  │  │(Auto-scaling)│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🐳 Docker Containerization

### Multi-Stage Dockerfile Explanation

Our Dockerfile uses a **multi-stage build** approach for optimal security and performance:

#### Stage 1: Builder
```dockerfile
FROM node:18-alpine AS builder
```

**Why this approach?**
- **Smaller final image**: Only production artifacts are included
- **Security**: Development tools and source code aren't in the final image
- **Caching**: Dependencies are cached separately from source code
- **Build optimization**: All build tools available during compilation

#### Stage 2: Runtime
```dockerfile
FROM node:18-alpine AS runtime
```

**Security best practices implemented:**
- **Non-root user**: Runs as user `saanse` (UID 1001)
- **Minimal base image**: Alpine Linux for smaller attack surface
- **Health checks**: Built-in application health monitoring
- **Resource constraints**: Defined in Kubernetes manifests

### Building the Image

```bash
# Build locally
docker build -t saanse:latest .

# For Minikube (uses Minikube's Docker daemon)
eval $(minikube docker-env)
docker build -t saanse:latest .
```

## ☸️ Kubernetes Manifests

### 1. Namespace (`k8s/namespace.yaml`)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: saanse
```

**Purpose**: Isolates SAANSE resources from other applications
**Best Practice**: Always use namespaces for multi-tenant clusters

### 2. ConfigMap (`k8s/configmap.yaml`)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: saanse-config
  namespace: saanse
data:
  NODE_ENV: "production"
  PORT: "3000"
  BASE_URL: "http://saanse.local"
```

**Purpose**: Stores non-sensitive configuration
**Best Practice**: Separates configuration from code, enables easy updates

### 3. Secret (`k8s/secret.yaml`)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: saanse-secrets
  namespace: saanse
type: Opaque
data:
  SUPABASE_URL: <base64-encoded-value>
  # ... other secrets
```

**Purpose**: Stores sensitive data (API keys, database URLs)
**Best Practice**: Base64 encoded, never committed to version control

### 4. Deployment (`k8s/deployment.yaml`)

**Key features implemented:**

#### Security Context
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001
  fsGroup: 1001
```

#### Resource Management
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

#### Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 5. Service (`k8s/service.yaml`)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: saanse-service
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
```

**Purpose**: Provides stable network endpoint for pods
**Best Practice**: ClusterIP for internal communication, LoadBalancer for external

### 6. Ingress (`k8s/ingress.yaml`)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: saanse-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: saanse.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: saanse-service
            port:
              number: 80
```

**Purpose**: Provides external access with custom domain
**Best Practice**: SSL termination, path-based routing, rate limiting

### 7. HPA (`k8s/hpa.yaml`)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Purpose**: Automatically scales pods based on CPU/memory usage
**Best Practice**: Prevents overload, ensures high availability

## 🎯 Minikube Setup

### Installation and Configuration

```bash
# Install Minikube
brew install minikube

# Start with recommended resources
minikube start --driver=docker --cpus=4 --memory=4096

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server
```

### Why These Settings?

- **Driver=docker**: Most compatible across platforms
- **CPUs=4**: Adequate for development and testing
- **Memory=4096**: Sufficient for multiple replicas
- **Ingress addon**: Enables external access
- **Metrics-server**: Required for HPA functionality

## 🚀 Deployment Process

### Quick Start (Automated)

```bash
# 1. Setup secrets (interactive)
./scripts/setup-secrets.sh

# 2. Build and deploy everything
./scripts/build-and-deploy.sh

# 3. Access your application
open http://saanse.local
```

### Manual Deployment

```bash
# 1. Start Minikube
minikube start --driver=docker --cpus=4 --memory=4096
minikube addons enable ingress metrics-server

# 2. Build Docker image
eval $(minikube docker-env)
docker build -t saanse:latest .

# 3. Setup secrets
./scripts/setup-secrets.sh

# 4. Deploy to Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# 5. Wait for deployment
kubectl wait --for=condition=available --timeout=300s deployment/saanse-app -n saanse

# 6. Setup local DNS
echo "$(minikube ip) saanse.local" | sudo tee -a /etc/hosts

# 7. Access application
open http://saanse.local
```

## 📚 Best Practices Explained

### 1. **Multi-Stage Docker Builds**
- **Benefit**: Reduces final image size by 60-80%
- **Security**: Eliminates build tools from production image
- **Performance**: Faster deployment and startup times

### 2. **Non-Root Container Execution**
- **Security**: Limits potential damage from container escapes
- **Compliance**: Meets security standards for production environments
- **Best Practice**: Always use dedicated user accounts

### 3. **Resource Requests and Limits**
- **Stability**: Prevents resource starvation
- **Scheduling**: Helps Kubernetes make better placement decisions
- **Cost Control**: Prevents runaway resource consumption

### 4. **Health Checks**
- **Reliability**: Automatic restart of unhealthy containers
- **Zero-downtime**: Ensures traffic only goes to healthy pods
- **Monitoring**: Provides visibility into application health

### 5. **ConfigMaps and Secrets**
- **Security**: Separates sensitive data from application code
- **Flexibility**: Easy configuration updates without rebuilds
- **Compliance**: Meets security requirements for credential management

### 6. **Horizontal Pod Autoscaling**
- **Performance**: Automatically handles traffic spikes
- **Cost Efficiency**: Scales down during low usage
- **Reliability**: Maintains performance under load

### 7. **Ingress Controller**
- **Flexibility**: Single entry point for multiple services
- **SSL Termination**: Centralized certificate management
- **Load Balancing**: Distributes traffic across pods

### 8. **Namespace Isolation**
- **Security**: Isolates resources and permissions
- **Organization**: Logical separation of environments
- **Resource Management**: Enables resource quotas and limits

## 🔍 Monitoring and Debugging

### Useful Commands

```bash
# Check pod status
kubectl get pods -n saanse

# View pod logs
kubectl logs -f deployment/saanse-app -n saanse

# Describe deployment
kubectl describe deployment saanse-app -n saanse

# Check ingress
kubectl get ingress -n saanse

# Port forward for debugging
kubectl port-forward service/saanse-service 8080:80 -n saanse

# Scale deployment
kubectl scale deployment saanse-app --replicas=3 -n saanse

# Check HPA status
kubectl get hpa -n saanse
```

### Minikube Commands

```bash
# Access Minikube dashboard
minikube dashboard

# SSH into Minikube
minikube ssh

# Check Minikube status
minikube status

# View Minikube IP
minikube ip

# Stop/Start Minikube
minikube stop
minikube start
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. **Image Pull Errors**
```bash
# Ensure you're using Minikube's Docker daemon
eval $(minikube docker-env)
docker build -t saanse:latest .
```

#### 2. **Ingress Not Working**
```bash
# Check if ingress addon is enabled
minikube addons list | grep ingress

# Enable if not active
minikube addons enable ingress

# Verify ingress controller is running
kubectl get pods -n ingress-nginx
```

#### 3. **DNS Resolution Issues**
```bash
# Check /etc/hosts entry
grep saanse.local /etc/hosts

# Add if missing
echo "$(minikube ip) saanse.local" | sudo tee -a /etc/hosts
```

#### 4. **Pod Startup Issues**
```bash
# Check pod events
kubectl describe pod <pod-name> -n saanse

# View detailed logs
kubectl logs <pod-name> -n saanse --previous
```

#### 5. **Health Check Failures**
```bash
# Test health endpoint directly
kubectl port-forward service/saanse-service 8080:80 -n saanse
curl http://localhost:8080/api/health
```

## 🏭 Production Considerations

### Security Enhancements

1. **Network Policies**: Restrict pod-to-pod communication
2. **RBAC**: Implement role-based access control
3. **Pod Security Standards**: Enforce security policies
4. **Image Scanning**: Scan for vulnerabilities
5. **Secret Management**: Use external secret stores (Vault, AWS Secrets Manager)

### Performance Optimizations

1. **Resource Tuning**: Optimize requests/limits based on metrics
2. **Caching**: Implement Redis for session storage
3. **CDN**: Use CDN for static assets
4. **Database**: Optimize database queries and indexing
5. **Monitoring**: Implement comprehensive monitoring (Prometheus, Grafana)

### High Availability

1. **Multi-Zone Deployment**: Deploy across availability zones
2. **Database Replication**: Setup read replicas
3. **Backup Strategy**: Implement automated backups
4. **Disaster Recovery**: Plan for disaster scenarios
5. **Load Testing**: Regular performance testing

### Example Production Manifest Updates

```yaml
# Production deployment with anti-affinity
spec:
  replicas: 6
  template:
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app.kubernetes.io/name
                  operator: In
                  values:
                  - saanse
              topologyKey: kubernetes.io/hostname
```

## 🧹 Cleanup

When you're done testing:

```bash
# Automated cleanup
./scripts/cleanup.sh

# Manual cleanup
kubectl delete namespace saanse
minikube stop
minikube delete
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Kubernetes events: `kubectl get events -n saanse`
3. Check application logs: `kubectl logs -f deployment/saanse-app -n saanse`
4. Verify Minikube status: `minikube status`

## 🎉 Conclusion

This deployment setup provides:

- **Production-ready containerization** with security best practices
- **Scalable Kubernetes architecture** with auto-scaling
- **Local development environment** that mirrors production
- **Comprehensive monitoring and debugging** capabilities
- **Easy deployment and cleanup** with automation scripts

The configuration follows industry best practices for:
- Security (non-root users, resource limits, health checks)
- Scalability (HPA, multiple replicas, resource management)
- Maintainability (clear separation of concerns, comprehensive documentation)
- Reliability (health checks, graceful shutdowns, proper error handling)

Your SAANSE platform is now ready for both development and production deployment! 🚀
