# 🐳 SAANSE Platform - Docker Setup Guide

This guide will help you containerize and deploy your SAANSE platform for public testing.

## ✅ Current Status

Your project is **95% ready** for Docker containerization! Here's what's already set up:

### ✅ What's Working:
- ✅ Multi-stage Dockerfile (optimized for production)
- ✅ Docker Compose configuration
- ✅ Health check endpoint (`/api/health`)
- ✅ Build process (fixed and tested)
- ✅ Kubernetes manifests for production deployment
- ✅ Production server configuration
- ✅ Environment variable template

### ⚠️ What Needs Your Action:

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up Environment Variables
```bash
# Copy the template and fill in your values
cp .env.example .env

# Edit the .env file with your actual Supabase credentials
nano .env
```

**Required Environment Variables:**
```env
NODE_ENV=production
PORT=3000
BASE_URL=http://localhost:3000

# Get these from your Supabase project dashboard
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Optional: For production database
DATABASE_URL=your_database_connection_string
```

### Step 2: Start Docker Desktop
```bash
# On macOS
open -a Docker

# On Windows
# Start Docker Desktop from Start Menu

# On Linux
sudo systemctl start docker
```

### Step 3: Build and Run
```bash
# Build the Docker image
docker build -t saanse:latest .

# Run the container
docker run -p 3000:3000 --env-file .env saanse:latest
```

## 🌐 Public URL Options

### Option 1: Local Development with Tunneling
```bash
# Using ngrok (install: brew install ngrok)
ngrok http 3000

# Using localtunnel
npx localtunnel --port 3000
```

### Option 2: Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# Your app will be available at http://localhost:3000
```

### Option 3: Kubernetes with Minikube
```bash
# Use the provided script
chmod +x scripts/build-and-deploy.sh
./scripts/build-and-deploy.sh

# Access at http://saanse.local (after DNS setup)
```

## 🔧 Troubleshooting

### Common Issues:

1. **Docker daemon not running**
   ```bash
   # Start Docker Desktop first
   open -a Docker
   ```

2. **Missing environment variables**
   ```bash
   # Make sure .env file exists and has all required variables
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Build failures**
   ```bash
   # Clean and rebuild
   docker system prune -a
   docker build -t saanse:latest .
   ```

4. **Port already in use**
   ```bash
   # Use a different port
   docker run -p 3001:3000 --env-file .env saanse:latest
   ```

## 📊 Health Check

Your application includes a health check endpoint:
- **URL**: `http://localhost:3000/api/health`
- **Response**: JSON with status, timestamp, uptime, and environment

## 🚀 Production Deployment

For production deployment, you have several options:

### 1. Cloud Platforms
- **Railway**: Connect your GitHub repo
- **Render**: Deploy from Docker image
- **DigitalOcean App Platform**: Container deployment
- **AWS ECS/Fargate**: Enterprise-grade container orchestration

### 2. VPS Deployment
```bash
# On your VPS
git clone your-repo
cd saanse-replit
cp .env.example .env
# Edit .env with production values
docker-compose up -d
```

### 3. Kubernetes (Production)
```bash
# Deploy to any Kubernetes cluster
kubectl apply -f k8s/
```

## 🔒 Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong secrets** for JWT and database credentials
3. **Enable HTTPS** in production
4. **Set up proper CORS** for your domain
5. **Use environment-specific configurations**

## 📝 Next Steps

1. ✅ Set up your `.env` file with Supabase credentials
2. ✅ Start Docker Desktop
3. ✅ Build and test locally
4. ✅ Choose your public URL method
5. ✅ Deploy to your preferred platform

## 🆘 Need Help?

If you encounter any issues:
1. Check the logs: `docker logs <container_id>`
2. Verify environment variables: `docker exec <container_id> env`
3. Test health endpoint: `curl http://localhost:3000/api/health`
4. Check the troubleshooting section above

Your SAANSE platform is ready for containerization! 🎉
