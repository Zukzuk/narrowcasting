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
  // Build the Docker image with the version tag, latest tag, and pass VERSION build argument
  execSync(`docker build --build-arg VERSION_TAG=${VERSION_TAG} -t ${VERSION_TAG} -t ${LATEST_TAG} .`, { stdio: 'inherit' });
  // Push both tags to the Docker registry
  console.log(`Pushing ${VERSION_TAG} and 'latest' to Docker registry...`);
  execSync(`docker push ${VERSION_TAG}`, { stdio: 'inherit' });
  execSync(`docker push ${LATEST_TAG}`, { stdio: 'inherit' });

  console.log("Docker image built and tagged with both version and 'latest' successfully.");
} catch (error) {
  console.error("Error during Docker build or push:", error.message);
  process.exit(1);
}
