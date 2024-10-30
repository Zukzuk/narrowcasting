const { execSync } = require('child_process');
const { version } = require('../package.json');

// Check if the version tag exists
if (!version) {
  console.error("Error: No version found in package.json. Please specify a version.");
  process.exit(1);
}

// Define Docker image name and tags
const IMAGE_NAME = "zukzuk/narrowcasting";
const VERSION_TAG = `${IMAGE_NAME}:${version}`;
const LATEST_TAG = `${IMAGE_NAME}:latest`;

try {
  // Build Docker image with the version tag only
  console.log(`Building Docker image with tag ${VERSION_TAG}...`);
  execSync(`docker build -t ${VERSION_TAG} .`, { stdio: 'inherit' });

  // Push the versioned image tag only
  console.log(`Pushing ${VERSION_TAG} to Docker registry...`);
  execSync(`docker push ${VERSION_TAG}`, { stdio: 'inherit' });

  // Tag the versioned image as 'latest' remotely
  console.log(`Tagging ${VERSION_TAG} as 'latest'...`);
  execSync(`docker tag ${VERSION_TAG} ${LATEST_TAG}`);
  execSync(`docker push ${LATEST_TAG}`, { stdio: 'inherit' });

  console.log("Docker image built and tagged as 'latest' successfully.");
} catch (error) {
  console.error("Error during Docker build or push:", error.message);
  process.exit(1);
}
