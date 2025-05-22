#!/bin/bash

# Script to monitor the BigganBondhu application health and send alerts
# Can be run as a cron job on the server

# Configuration
APP_URL="http://localhost:8000/api/health"
LOG_FILE="/var/log/bigganbondhu/monitor.log"
ALERT_EMAIL="admin@example.com"  # Change to your email
MAX_MEMORY_PERCENT=80
MAX_DISK_PERCENT=85

# Create log directory if it doesn't exist
mkdir -p $(dirname $LOG_FILE)

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if docker is running
check_docker() {
    if ! systemctl is-active --quiet docker; then
        log "ERROR: Docker service is not running!"
        send_alert "Docker service is down on $(hostname)"
        return 1
    fi
    return 0
}

# Check if our containers are running
check_containers() {
    if [ $(docker ps -q --filter name=bigganbondhu --filter status=running | wc -l) -lt 1 ]; then
        log "ERROR: BigganBondhu containers are not running!"
        send_alert "BigganBondhu containers are down on $(hostname)"
        return 1
    fi
    return 0
}

# Check API health endpoint
check_api_health() {
    response=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)
    if [ "$response" != "200" ]; then
        log "ERROR: API health check failed! HTTP response: $response"
        send_alert "BigganBondhu API health check failed on $(hostname)"
        return 1
    fi
    log "API health check: OK (HTTP $response)"
    return 0
}

# Check system resources
check_resources() {
    # Check memory usage
    memory_usage=$(free | grep Mem | awk '{print $3/$2 * 100.0}' | cut -d. -f1)
    if [ $memory_usage -gt $MAX_MEMORY_PERCENT ]; then
        log "WARNING: High memory usage: ${memory_usage}%"
        send_alert "High memory usage (${memory_usage}%) on $(hostname)"
    fi

    # Check disk usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d% -f1)
    if [ $disk_usage -gt $MAX_DISK_PERCENT ]; then
        log "WARNING: High disk usage: ${disk_usage}%"
        send_alert "High disk usage (${disk_usage}%) on $(hostname)"
    fi
}

# Send an alert
send_alert() {
    # You can replace this with any notification method (email, Slack, etc.)
    if command -v mail >/dev/null 2>&1; then
        echo "$1" | mail -s "BigganBondhu Alert: $(date '+%Y-%m-%d %H:%M:%S')" $ALERT_EMAIL
        log "Alert sent: $1"
    else
        log "Alert triggered but mail command not available: $1"
    fi
}

# Main function
main() {
    log "--- Starting monitoring check ---"

    check_docker || return 1
    check_containers || return 1
    check_api_health || return 1
    check_resources

    log "All checks passed. System is healthy."
    log "--- Monitoring check complete ---"
}

# Run the main function
main
