const path = require('path');
const { execSync } = require('child_process');
const { version } = require('../package.json');

// Main function to orchestrate the script execution
function main() {
  if (!version) {
    console.error("Error: No version found in package.json. Please specify a version.");
    process.exit(1);
  }
  buildAndPushDockerImage(version);
}

// Function to build and push the Docker image
function buildAndPushDockerImage(VERSION_TAG) {
  const imageVersionTag = `zukzuk/narrowcasting:${VERSION_TAG}`;
  const imageLatestTag = `zukzuk/narrowcasting:latest`;
  try {
    console.log("Building Docker image...");
    execSync(`docker build -f ${path.join(__dirname, '../deploy/Dockerfile.release')} --build-arg VERSION_TAG=${VERSION_TAG} -t ${imageVersionTag} -t ${imageLatestTag} .`, { stdio: 'inherit' });
    console.log(`Pushing '${VERSION_TAG}' and 'latest' to Docker registry...`);
    execSync(`docker push ${imageVersionTag}`, { stdio: 'inherit' });
    execSync(`docker push ${imageLatestTag}`, { stdio: 'inherit' });
    console.log(`Docker image built and tagged with both ${VERSION_TAG} and 'latest' successfully.`);
  } catch (error) {
    console.error("Error during Docker build or push:", error.message);
    process.exit(1);
  }
}

// Run the main function
main();
