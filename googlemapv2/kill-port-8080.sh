#!/bin/bash
echo "Checking for processes on port 8080..."
PROCESS=$(lsof -ti:8080)
if [ -z "$PROCESS" ]; then
    echo "No process found on port 8080"
else
    echo "Killing process $PROCESS on port 8080..."
    kill -9 $PROCESS
    echo "Port 8080 is now free"
fi

