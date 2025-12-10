#!/bin/bash
echo "Starting Backend Server on port 8080..."
cd "$(dirname "$0")"
mvn spring-boot:run

