# GitHub Actions Workflow Guide

This guide explains how the GitHub Actions workflows for the BigganBondhu project function.

## Available Workflows

This repository contains the following GitHub Actions workflows:

1. **Deploy Backend to GCP VM** - Builds and deploys the backend to a Google Cloud VM

   - Location: `.github/workflows/deploy-backend.yml`
   - Triggered on: Push to `main` branch in the `backend` directory or manual trigger

2. **Deploy Frontend** - Builds the frontend and pushes it to GitHub Container Registry
   - Location: `.github/workflows/deploy-frontend.yml`
   - Triggered on: Push to `main` branch in the `frontend` directory or manual trigger

## How the Backend Workflow Works

The backend workflow performs these key steps:

1. **Checkout** - Retrieves the latest code from the repository
2. **Build Image** - Builds a Docker image from the `Dockerfile` in the `backend` directory
3. **Push to Registry** - Pushes the built image to GitHub Container Registry
4. **SSH to VM** - Connects to the Google Cloud VM using the provided SSH key
5. **Deploy** - Updates the Docker Compose file and pulls the latest image to deploy

## How the Frontend Workflow Works

The frontend workflow:

1. **Checkout** - Retrieves the latest code from the repository
2. **Build Image** - Builds a Docker image from the `Dockerfile` in the `frontend/bigganbondhu` directory
3. **Push to Registry** - Pushes the built image to GitHub Container Registry

## Handling Secrets

These workflows use several secrets:

- `GITHUB_TOKEN` - Automatically provided by GitHub, used for pushing to GitHub Container Registry
- `GCP_SSH_PRIVATE_KEY` - The SSH key for accessing your VM
- `GCP_VM_IP` - Your VM's IP address
- `GCP_VM_USER` - Your VM username

## Manually Triggering Workflows

To trigger a workflow manually:

1. Go to the "Actions" tab in your GitHub repository
2. Select the workflow you want to run
3. Click "Run workflow"
4. Select the branch you want to run it on (usually `main`)
5. Click "Run workflow"

## Monitoring Workflow Runs

You can monitor workflow runs in the "Actions" tab. Each run will show:

- The commit that triggered it
- The status (success/failure)
- Detailed logs for each step

## Troubleshooting

Common issues and solutions:

1. **Authentication failures** - Check that your SSH key is correctly added to both GitHub secrets and the VM
2. **Docker build failures** - Check the build logs for errors in your Dockerfile
3. **Deployment failures** - Verify that Docker and Docker Compose are properly installed on your VM
