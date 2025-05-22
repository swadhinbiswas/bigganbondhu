# BigganBondhu: Interactive Science Education Platform

## Problem Addressed

Science education in Bangladesh and similar regions faces critical challenges:

- **Limited Laboratory Access**: Many schools lack proper laboratory facilities for hands-on science experiments
- **Visualization Barriers**: Students struggle to grasp abstract scientific concepts without proper visualization tools
- **Language Barriers**: Most science educational resources are in English, creating comprehension challenges for Bangla-speaking students
- **Engagement Issues**: Traditional teaching methods often fail to engage students in scientific exploration
- **Resource Disparities**: Significant gap between urban and rural educational resources for science learning

## Solution

BiggonBondhu provides a comprehensive digital platform that addresses these challenges through:

- **Virtual Laboratories**: Interactive simulations that replicate real-world experiments without physical equipment
- **3D Visualization**: Advanced rendering of complex scientific concepts using Three.js and other visualization libraries
- **Full Bangla Support**: Complete Bangla language interface with text-to-speech narration for accessibility
- **Gamified Learning**: Engaging, interactive experiences that make learning science enjoyable
- **Cross-Platform Accessibility**: Web-based solution accessible on various devices with minimal requirements

## Key Features

### Physics Engine

- Real-time physics simulations using Matter.js
- Interactive experiments including:
  - Projectile motion with adjustable parameters
  - Electric circuit simulator with drag-and-drop components
  - Newton's laws demonstrations
  - Pendulum motion and wave interference visualizations
  - Inclined plane and circular motion simulations

### Biology Engine

- 3D biological models using Three.js
- Interactive explorations of:
  - Human heart with annotated parts and blood flow visualization
  - Cell structure with detailed organelle information
  - DNA simulation with base pair interactions
  - Photosynthesis process visualization
  - Comparative cell studies

### Chemistry Engine

- Virtual chemistry experiments with visual reactions
- Features include:
  - Acid-base reactions with pH indicators
  - Precipitation reactions with visual effects
  - Interactive periodic table
  - Atom builder with 3D visualization
  - Temperature and mixing speed effects on reactions

### Cross-Cutting Features

- 🇧🇩 **Bangla Language Support**: Complete UI and narration in Bangla
- 🔊 **Audio Narration**: Text-to-speech explanations for all experiments
- 📱 **Responsive Design**: Works on desktops, tablets, and mobile devices
- 🧩 **Modular Architecture**: Separate engines for different science disciplines
- 🌐 **Offline Capability**: Key features work without continuous internet connection

## Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **3D Rendering**: Three.js with React Three Fiber for 3D biology models
- **Physics Engine**: Matter.js for realistic physics simulations
- **Animation**: Framer Motion and Anime.js for smooth UI transitions
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: Zustand for global state
- **Routing**: React Router for navigation
- **Audio**: Howler.js for audio playback

### Backend

- **Framework**: FastAPI (Python)
- **API Documentation**: Automatic Swagger/OpenAPI documentation
- **Text-to-Speech**: gTTS (Google Text-to-Speech) for Bangla narration
- **Data Storage**: SQLite with sqlite-utils for lightweight database
- **API Features**:
  - Experiment data endpoints
  - Audio generation for narration
  - Chemical reaction simulation
  - 3D model serving

### DevOps

- **Containerization**: Docker and Docker Compose
- **CI/CD**: GitHub Actions for automated deployment
- **Deployment**: Google Cloud VM
- **Monitoring**: Custom server monitoring script

## Impact & Future Scope

### Current Impact

- Democratizes access to quality science education regardless of laboratory access
- Bridges the language gap in science education with Bangla support
- Makes abstract scientific concepts tangible through interactive visualization
- Provides teachers with digital tools to enhance classroom instruction

### Future Development Roadmap

1. **Content Expansion**:

   - Cover complete national curriculum for grades 6-12
   - Add more complex simulations for advanced topics

2. **Enhanced Interactivity**:

   - Collaborative features for classroom use
   - Virtual reality support for immersive experiences

3. **Accessibility Improvements**:

   - Offline mode for areas with limited internet connectivity
   - Low-bandwidth optimizations for rural areas

4. **Assessment Integration**:

   - Built-in quizzes and assessments
   - Progress tracking for students and teachers

5. **AI Enhancement**:
   - Personalized learning paths based on student performance
   - Natural language processing for Bangla queries about scientific concepts

## Team D3xx

BiggonBondhu is developed by Team D3xx, a group dedicated to improving science education through technology.

## Getting Started

For setup instructions, see:

- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Docker Deployment](#docker-deployment)

For detailed documentation:

- [Deployment Guide](DEPLOYMENT.md)
- [GitHub Actions Setup](GITHUB-ACTIONS.md)
- [VM Setup Instructions](VM-SETUP.md)

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

## API Documentation

When the backend is running, you can access the API documentation at:

- http://localhost:8000/docs

## License

This project is licensed under the MIT License.
