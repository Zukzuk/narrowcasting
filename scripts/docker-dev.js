const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { version } = require('../package.json');

const envFilePath = path.join(__dirname, '../prd/public.env');

// Main function to orchestrate the script execution
function main() {
  if (!version) {
    console.error("Error: No version found in package.json. Please specify a version.");
    process.exit(1);
  }

  updateVersionTag(envFilePath, version);
  buildAndComposeDev(version);
}

// Function to update VERSION_TAG in public.env
function updateVersionTag(filePath, version) {
  try {
    let envContent = fs.readFileSync(filePath, 'utf8');
    if (envContent.match(/^VERSION_TAG=.*$/m)) {
      envContent = envContent.replace(/^VERSION_TAG=.*$/m, `VERSION_TAG=${version}`);
    } else {
      envContent += `\nVERSION_TAG=${version}`;
    }
    fs.writeFileSync(filePath, envContent);
  } catch (error) {
    console.error("Error updating .env.public file:", error.message);
    process.exit(1);
  }
}

// Function to build and push the Docker image
function buildAndComposeDev(VERSION_TAG) {
  try {
    // Set VERSION_TAG as an environment variable and run Docker Compose build and up
    console.log(`Starting Docker Compose with VERSION_TAG=${VERSION_TAG}...`);
    execSync(`docker-compose -f docker-compose.dev.yml up --build`, {
      stdio: 'inherit',
      env: { ...process.env, VERSION_TAG }
    });
    console.log("Docker Compose started successfully.");
  } catch (error) {
    console.error("Error starting Docker Compose:", error.message);
    process.exit(1);
  }
}

// Run the main function
main();
