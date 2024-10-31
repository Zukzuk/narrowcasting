const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read and parse package.json to get the version tag
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const VERSION_TAG = packageJson.version;

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
