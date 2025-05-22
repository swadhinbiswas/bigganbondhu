#!/bin/bash

# Exit on error
set -e

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
VM_USER=""
VM_IP=""
SSH_KEY_PATH=""
IMAGE_TAG="latest"

# Function to display help
show_help() {
    echo -e "${BLUE}BigganBondhu Manual Deployment Script${NC}"
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -u, --user USER       SSH username for the VM"
    echo "  -i, --ip IP           IP address of the VM"
    echo "  -k, --key PATH        Path to SSH private key"
    echo "  -t, --tag TAG         Docker image tag (default: latest)"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 --user john --ip 10.0.0.10 --key ~/.ssh/gcp_key"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -u|--user)
            VM_USER="$2"
            shift 2
            ;;
        -i|--ip)
            VM_IP="$2"
            shift 2
            ;;
        -k|--key)
            SSH_KEY_PATH="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Check required parameters
if [[ -z "$VM_USER" || -z "$VM_IP" ]]; then
    echo -e "${RED}Error: Missing required parameters.${NC}"
    show_help
    exit 1
fi

SSH_OPTIONS=""
if [[ -n "$SSH_KEY_PATH" ]]; then
    SSH_OPTIONS="-i $SSH_KEY_PATH"
fi

echo -e "${BLUE}=== BigganBondhu Manual Deployment ===${NC}"
echo -e "${GREEN}Target: ${NC}$VM_USER@$VM_IP"
echo -e "${GREEN}Image Tag: ${NC}$IMAGE_TAG"
echo ""

# Build the backend Docker image
echo -e "${YELLOW}Building backend Docker image...${NC}"
docker build -t bigganbondhu-backend:$IMAGE_TAG ./backend

# Check if the remote directory exists, create if not
echo -e "${YELLOW}Creating necessary directories on VM...${NC}"
ssh $SSH_OPTIONS $VM_USER@$VM_IP "mkdir -p ~/bigganbondhu/data"

# Save the image to a tar file
echo -e "${YELLOW}Saving Docker image to a tar file...${NC}"
docker save bigganbondhu-backend:$IMAGE_TAG | gzip > backend-image.tar.gz

# Copy the image to the VM
echo -e "${YELLOW}Copying Docker image to VM...${NC}"
scp $SSH_OPTIONS backend-image.tar.gz $VM_USER@$VM_IP:~/bigganbondhu/

# Copy docker-compose file
echo -e "${YELLOW}Copying docker-compose.yml to VM...${NC}"
scp $SSH_OPTIONS docker-compose.yml $VM_USER@$VM_IP:~/bigganbondhu/

# Load the image and deploy
echo -e "${YELLOW}Loading and deploying Docker image on VM...${NC}"
ssh $SSH_OPTIONS $VM_USER@$VM_IP "cd ~/bigganbondhu && \
    docker load < backend-image.tar.gz && \
    docker-compose up -d && \
    rm backend-image.tar.gz"

# Clean up
rm backend-image.tar.gz

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "The application should now be running at http://$VM_IP:8000"
