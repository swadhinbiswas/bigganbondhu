# Science Education Platform

An interactive science education platform with simulations for physics, biology, and chemistry. The platform features Bangla language support and audio narration.

## Overview

This project provides a complete web-based science education platform with three interactive engines:

1. **Physics Engine**: Simulate mechanics like projectile motion and pendulum with adjustable parameters
2. **Biology Engine**: Explore 3D models of biological systems with interactive tooltips
3. **Chemistry Engine**: Perform virtual chemistry experiments with visual reactions

## Project Structure

```
/
├── backend/               # FastAPI Python backend
│   ├── app/              # Application modules
│   ├── data/             # Experiment data and audio files
│   └── main.py           # Main server file
│
└── frontend/             # React + Vite frontend
    ├── public/           # Static assets
    └── src/              # Source code
        ├── api/          # API service
        ├── components/   # React components
        │   └── engines/  # Physics, Biology, Chemistry engines
        └── App.tsx       # Main application component
```

## Features

- 🧪 **Interactive Simulations**: Real-time physics with e re, 3D biology models with Three.js, and chemistry reactions
- 🇧🇩 **Bangla Support**: Full Bangla language UI with text-to-speech narration
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔊 **Audio Narration**: Text-to-speech explanations for experiments
- 🧩 **Modular Architecture**: Separate engines for different science disciplines

## Getting Started

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend/bigganbondhu
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Docker Deployment

This project is containerized with Docker for easy deployment:

1. Build and run both services with Docker Compose:

   ```bash
   docker-compose up -d
   ```

2. Access the application:
   - Backend API: http://localhost:8000
   - Frontend: http://localhost:3000 (when frontend service is uncommented)

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Continuous Integration/Continuous Deployment

This project uses GitHub Actions for CI/CD:

1. **Automatic Deployment**: Changes pushed to the main branch automatically trigger deployment
2. **Containerized Builds**: Docker images are built and pushed to GitHub Container Registry
3. **VM Deployment**: Backend service is automatically deployed to a Google Cloud VM

Configure the GitHub workflow by setting up required secrets in your repository settings.
See [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md) for more information.

## Infrastructure Management

### Using the Makefile

The project includes a Makefile for common tasks:

```bash
# Show available commands
make help

# Build and run locally
make run-local

# Deploy to VM
make deploy VM_USER=username VM_IP=10.0.0.10
```

### Server Monitoring

A monitoring script is included to check server health:

```bash
# Run the monitoring script
./server-monitor.sh

# Setup as a cron job
crontab -e
# Add: */15 * * * * /path/to/bigganbondhu/server-monitor.sh
```

For VM setup instructions, see [VM-SETUP.md](VM-SETUP.md).

````

3. Run the server:
```bash
python main.py
````

The backend API will be available at http://localhost:8000.

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:5173.

## API Documentation

When the backend is running, you can access the API documentation at:

- http://localhost:8000/docs

## License

This project is licensed under the MIT License.
