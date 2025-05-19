# Science Education Platform Backend

This is the FastAPI backend for the Science Education Platform, providing API endpoints for physics, biology, and chemistry simulations.

## Features

- Physics simulation endpoints
- Biology 3D model data API
- Chemistry reaction simulation API
- Text-to-speech API for Bangla narration

## Setup and Installation

1. Make sure you have Python 3.10+ installed
2. Install dependencies:
   ```bash
   pip install -e .
   # OR
   pip install -r requirements.txt
   ```

## Running the Server

```bash
python main.py
# OR
uvicorn main:app --reload
```

The server will start at http://localhost:8000

## API Documentation

Once the server is running, you can access the Swagger documentation at:

- http://localhost:8000/docs

## Available Endpoints

- `GET /api/experiments/{category}` - Get all experiments for a category (physics, biology, chemistry)
- `GET /api/experiments/{category}/{experiment_id}` - Get specific experiment data
- `GET /api/reactions?chem1={chemical1}&chem2={chemical2}` - Get reaction results between two chemicals
- `GET /api/audio?text={text}` - Generate TTS audio for the given Bangla text

