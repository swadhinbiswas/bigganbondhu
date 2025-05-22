# Deployment Instructions for BigganBondhu

This document explains how to deploy the BigganBondhu application to a Google Cloud VM using GitHub Actions.

## Prerequisites

Before you begin, make sure you have:

1. A Google Cloud VM instance running
2. Docker and Docker Compose installed on your VM
3. A GitHub repository with the BigganBondhu codebase

## Setting Up GitHub Secrets

You need to add the following secrets to your GitHub repository:

1. `GCP_SSH_PRIVATE_KEY`: Your SSH private key for accessing the VM
2. `GCP_VM_IP`: The IP address of your Google Cloud VM
3. `GCP_VM_USER`: The username for SSH access to your VM

### How to Add GitHub Secrets:

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" -> "Actions" from the left sidebar
4. Click "New repository secret" and add each of the required secrets

## Deployment Process

The deployment process works as follows:

1. When you push changes to the `main` branch, GitHub Actions automatically builds a Docker image for the backend
2. The image is pushed to GitHub Container Registry (ghcr.io)
3. GitHub Actions connects to your Google Cloud VM via SSH
4. It pulls the latest image and deploys it using Docker Compose

## Manual Deployment

You can deploy using one of these methods:

### Using GitHub Actions Manually

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy Backend to GCP VM" workflow
3. Click "Run workflow" and select the branch to deploy

### Using the Manual Deploy Script

1. Make sure you have Docker installed on your local machine
2. Run the manual deployment script:
   ```bash
   ./manual-deploy.sh --user USERNAME --ip VM_IP --key PATH_TO_SSH_KEY
   ```

### Using the Makefile

```bash
# Deploy with all parameters
make deploy VM_USER=username VM_IP=10.0.0.10 SSH_KEY_PATH=~/.ssh/key

# Deploy with environment variables
export VM_USER=username
export VM_IP=10.0.0.10
export SSH_KEY_PATH=~/.ssh/key
make deploy
```

2. Select the "Deploy Backend to GCP VM" workflow
3. Click "Run workflow" and select the branch to deploy

## Local Development

For local development:

1. Run `docker-compose up` from the root directory to start both frontend and backend services
2. Access the backend API at http://localhost:8000
3. Access the frontend at http://localhost:3000 (when uncommented in the docker-compose.yml)

## Troubleshooting

If you encounter any issues:

1. Check the GitHub Actions logs for errors
2. Connect to your VM and check Docker logs: `docker logs $(docker ps -q --filter name=bigganbondhu-backend)`
3. Ensure your VM has enough resources to run the containers
