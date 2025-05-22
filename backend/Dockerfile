FROM python:3.10-slim-bullseye@sha256:f2ee145f3bc4e061f8dca6b975610c6e974e49a2f604ee6abf4d57908a5e89bf

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p data/audio data/experiments

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
