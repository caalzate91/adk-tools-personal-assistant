# Docker Deployment Guide

This guide explains how to deploy the Personal Assistant web app locally using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (included with Docker Desktop)
- Google Gemini API key
- Firebase project with Google Authentication enabled

## Quick Start

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Google API key:

```env
GOOGLE_API_KEY=your_actual_gemini_api_key_here
```

The Firebase configuration should be set up in your `.env` file for your Firebase project.

### 2. Enable Google Authentication in Firebase

**IMPORTANT**: You must enable Google Sign-in in the Firebase Console before running the app.

1. Go to [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers)
2. Click **"Get Started"** (if first time)
3. Click **"Google"** from the sign-in providers list
4. Toggle **"Enable"** to ON
5. Add a support email (your email)
6. Click **"Save"**

### 3. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

This will:
- Build the ADK backend container (Python + ADK)
- Build the frontend container (React + Nginx)
- Start both services with proper networking

### 4. Access the Application

Once the containers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

You can verify the backend is working:
```bash
curl http://localhost:8000/list-apps
# Expected: ["personal_assistant"]
```

### 5. Stop the Application

```bash
# Stop and remove containers
docker-compose down

# Stop, remove containers, and clean up volumes
docker-compose down -v
```

## Docker Commands Reference

```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f adk-backend

# Rebuild a specific service
docker-compose up -d --build frontend

# Restart a service
docker-compose restart adk-backend

# Check running containers
docker-compose ps

# Execute commands in a running container
docker-compose exec adk-backend /bin/bash
docker-compose exec frontend /bin/sh
```

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"

**Solution**: Enable Google Sign-in provider in Firebase Console (see step 2 above).

### Error: "Cannot reach backend"

1. Check if backend is healthy:
   ```bash
   docker-compose ps
   curl http://localhost:8000/list-apps
   ```

2. Check backend logs:
   ```bash
   docker-compose logs adk-backend
   ```

3. Verify `GOOGLE_API_KEY` is set in `.env`

### Error: "Port already in use"

If ports 3000 or 8000 are already in use, edit `docker-compose.yml` to change the port mappings:

```yaml
ports:
  - "3001:80"  # Change 3000 to 3001
```

### Rebuild from scratch

```bash
# Stop everything
docker-compose down

# Remove all images
docker-compose down --rmi all

# Rebuild
docker-compose up --build
```

## Architecture

```
┌─────────────────────┐
│   Browser           │
│   localhost:3000    │
└──────────┬──────────┘
           │
           ├─> Firebase Auth (Google OAuth)
           │
           ├─> Firebase Firestore (conversations)
           │
           └─> ADK Backend (localhost:8000)
                    │
                    └─> Google Gemini API
```

## Environment Variables

### Backend (.env)
- `GOOGLE_API_KEY`: Gemini API key (required)
- `GOOGLE_GENAI_USE_VERTEXAI`: Set to `true` to use Vertex AI
- `GOOGLE_CLOUD_PROJECT`: GCP project ID (if using Vertex AI)
- `GOOGLE_CLOUD_LOCATION`: GCP region (if using Vertex AI)

### Frontend (embedded at build time)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_ADK_BASE_URL`: Backend URL (default: http://localhost:8000)

## Production Considerations

For production deployment:

1. Use environment-specific `.env` files
2. Enable HTTPS/TLS
3. Configure proper CORS settings
4. Set up Firebase security rules
5. Use Docker secrets for sensitive data
6. Consider using a reverse proxy (Nginx/Traefik)
7. Set up monitoring and logging
8. Configure resource limits in docker-compose.yml

## Next Steps

- Read [specs/001-react-assistant-webapp/quickstart.md](specs/001-react-assistant-webapp/quickstart.md) for development setup
- Review [specs/001-react-assistant-webapp/spec.md](specs/001-react-assistant-webapp/spec.md) for feature details
- Check the main [README.md](README.md) for project overview
