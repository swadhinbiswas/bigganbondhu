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
   pip install -e .
   # OR
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python main.py
   ```

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
