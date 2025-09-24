# 🚀 SAANSE Platform - Scripts Guide

This guide explains how to use the automated scripts for running your SAANSE platform.

## 📁 Available Scripts

### 1. `start-saanse.sh` - Main Start Script
**Purpose**: One-command solution to start everything

**What it does**:
- ✅ Kills existing processes on ports 3000 & 4040
- ✅ Stops existing Docker containers
- ✅ Builds and starts Docker containers
- ✅ Optionally starts ngrok tunnel for public access
- ✅ Shows status and public URL

**Usage Options**:
```bash
# Interactive mode (asks about ngrok)
./start-saanse.sh

# Local only (no public access)
./start-saanse.sh --no-ngrok

# Public access (with ngrok, no prompt)
./start-saanse.sh --with-ngrok

# Show help
./start-saanse.sh --help
```

### 2. `stop-saanse.sh` - Stop Script
**Purpose**: Clean shutdown of all services

**What it does**:
- ✅ Stops Docker containers
- ✅ Kills ngrok tunnel
- ✅ Clears ports 3000 & 4040

**Usage**:
```bash
./stop-saanse.sh
```

### 3. `quick-test.sh` - Test Script
**Purpose**: Demonstrates start/stop functionality

**What it does**:
- ✅ Tests the complete workflow
- ✅ Verifies health endpoint
- ✅ Shows running processes

**Usage**:
```bash
./quick-test.sh
```

## 🎯 Quick Start

### First Time Setup:
```bash
# Make scripts executable (if not already done)
chmod +x *.sh

# Start everything (interactive mode)
./start-saanse.sh
```

### Daily Usage Options:

#### Interactive Mode (Recommended):
```bash
# Asks if you want ngrok tunnel
./start-saanse.sh
# Answer 'y' for public access or 'n' for local only
```

#### Local Development Only:
```bash
# No public access, local only
./start-saanse.sh --no-ngrok
```

#### Public Access (No Prompt):
```bash
# Automatically starts ngrok tunnel
./start-saanse.sh --with-ngrok
```

#### Stop Everything:
```bash
./stop-saanse.sh
```

## 🌐 What You Get

When you run `./start-saanse.sh`, you'll get:

1. **Local Access**: http://localhost:3000
2. **Public URL**: https://xxxxx.ngrok-free.app (for sharing)
3. **Health Check**: http://localhost:3000/api/health
4. **ngrok Dashboard**: http://localhost:4040

## 🔧 Troubleshooting

### If Docker isn't running:
```bash
# Start Docker Desktop
open -a Docker

# Wait a few seconds, then run
./start-saanse.sh
```

### If ports are still in use:
```bash
# Force kill everything
sudo lsof -ti :3000 | xargs sudo kill -9
sudo lsof -ti :4040 | xargs sudo kill -9

# Then start
./start-saanse.sh
```

### If you get permission errors:
```bash
# Make scripts executable
chmod +x *.sh
```

## 📊 Expected Output

When you run `./start-saanse.sh`, you should see:

```
🚀 SAANSE Platform - Quick Start Script
==============================================

[INFO] Checking prerequisites...
[SUCCESS] All prerequisites are available
[INFO] Cleaning up existing processes...
[SUCCESS] Port 3000 cleared
[SUCCESS] Port 4040 cleared
[INFO] Stopping existing Docker containers...
[SUCCESS] Docker containers stopped
[INFO] .env file found
[INFO] Building and starting Docker containers...
[SUCCESS] Application is ready!
[SUCCESS] ngrok tunnel started: https://xxxxx.ngrok-free.app

🎉 SAANSE Platform is now running!

Local URLs:
  • Application: http://localhost:3000
  • Health Check: http://localhost:3000/api/health
  • ngrok Dashboard: http://localhost:4040

🌐 Public URL: https://xxxxx.ngrok-free.app
```

## 🎉 You're All Set!

Now you can:
1. **Start**: `./start-saanse.sh`
2. **Share the public URL** with anyone for testing
3. **Stop**: `./stop-saanse.sh` when done

The script handles everything automatically - no more manual Docker commands! 🚀
