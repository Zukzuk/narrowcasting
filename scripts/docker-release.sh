#!/bin/bash

# Navigate to the root directory of the project (assuming the script is in /scripts)
cd "../"

# Fetch the latest version from package.json using Node.js
LATEST_TAG=$(node -p "require('./package.json').version")

# Check if the latest tag was found
if [ -z "$LATEST_TAG" ]; then
  echo "Error: No tags found. Please tag your release before running this script."
  exit 1
fi

# Define the Docker image name
IMAGE_NAME="zukzuk/narrowcasting"

# Build the Docker image with both the specific version tag and the 'latest' tag
docker build -t $IMAGE_NAME:$LATEST_TAG -t $IMAGE_NAME:latest .

# Push both tags to the Docker registry
docker push $IMAGE_NAME:$LATEST_TAG
docker push $IMAGE_NAME:latest
