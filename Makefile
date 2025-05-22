# Makefile for BigganBondhu project
.PHONY: help build-backend build-frontend run-local deploy clean

# Default target
help:
	@echo "BigganBondhu Development Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  help              Show this help message"
	@echo "  build-backend     Build backend Docker image"
	@echo "  build-frontend    Build frontend Docker image"
	@echo "  run-local         Run entire application locally using Docker Compose"
	@echo "  deploy            Deploy to Google Cloud VM (requires VM_USER, VM_IP, SSH_KEY_PATH)"
	@echo "  clean             Clean up Docker images and containers"
	@echo ""
	@echo "Environment Variables:"
	@echo "  VM_USER           Username for SSH access to VM"
	@echo "  VM_IP             IP address of the VM"
	@echo "  SSH_KEY_PATH      Path to SSH private key file"
	@echo "  TAG               Docker image tag (default: latest)"
	@echo ""
	@echo "Examples:"
	@echo "  make run-local"
	@echo "  make deploy VM_USER=username VM_IP=10.0.0.10 SSH_KEY_PATH=~/.ssh/key"

# Set default values for variables
TAG ?= latest

# Build backend Docker image
build-backend:
	@echo "Building backend Docker image..."
	docker build -t bigganbondhu-backend:$(TAG) ./backend

# Build frontend Docker image
build-frontend:
	@echo "Building frontend Docker image..."
	docker build -t bigganbondhu-frontend:$(TAG) ./frontend/bigganbondhu

# Run application locally with Docker Compose
run-local:
	@echo "Starting application locally..."
	docker-compose up -d

# Deploy to Google Cloud VM
deploy:
	@if [ -z "$(VM_USER)" ] || [ -z "$(VM_IP)" ]; then \
		echo "Error: VM_USER and VM_IP must be provided."; \
		echo "Usage: make deploy VM_USER=username VM_IP=10.0.0.10 [SSH_KEY_PATH=~/.ssh/key]"; \
		exit 1; \
	fi
	@echo "Deploying to VM: $(VM_USER)@$(VM_IP)..."
	@if [ -n "$(SSH_KEY_PATH)" ]; then \
		./manual-deploy.sh --user $(VM_USER) --ip $(VM_IP) --key $(SSH_KEY_PATH) --tag $(TAG); \
	else \
		./manual-deploy.sh --user $(VM_USER) --ip $(VM_IP) --tag $(TAG); \
	fi

# Clean up Docker resources
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down
	docker rmi bigganbondhu-backend:$(TAG) bigganbondhu-frontend:$(TAG) || true
	docker system prune -f
