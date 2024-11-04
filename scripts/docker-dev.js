const { execSync } = require('child_process');
const { version } = require('../package.json');

// Main function to orchestrate the script execution
function main() {
  if (!version) {
    console.error("Error: No version found in package.json. Please specify a version.");
    process.exit(1);
  }
  buildAndComposeDev(version);
}

// Function to build and push the Docker image
function buildAndComposeDev(VERSION_TAG) {
  try {
    // Set VERSION_TAG as an environment variable and run Docker Compose build and up
    console.log(`Starting Docker compose with VERSION_TAG=${VERSION_TAG}...`);
    execSync(`docker-compose -f docker-compose.dev.yml up --build`, {
      stdio: 'inherit',
      env: { ...process.env, VERSION_TAG }
    });
    console.log("Docker compose started successfully.");
  } catch (error) {
    console.error("Error starting Docker compose:", error.message);
    process.exit(1);
  }
}

// Run the main function
main();
