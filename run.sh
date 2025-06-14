#!/bin/bash

# Function to show usage
show_usage() {
    echo "Usage: ./run.sh [server|update]"
    echo "  server  - Run the server with automatic updates every 5 minutes"
    echo "  update  - Run a one-time update and exit"
    exit 1
}

# Check if mode is provided
if [ $# -eq 0 ]; then
    show_usage
fi

# Get the mode
MODE=$1

# Run the appropriate command
case $MODE in
    "server")
        echo "Starting server mode..."
        npm run server
        ;;
    "update")
        echo "Running one-time update..."
        npm run update
        ;;
    *)
        show_usage
        ;;
esac 