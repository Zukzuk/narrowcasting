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

  const envVars = loadEnvVariables(envFilePath);
  updateVersionTag(envFilePath, version);
  buildAndPushDockerImage(envVars, version);
}

// Function to load all environment variables from public.env
function loadEnvVariables(filePath) {
  try {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const envVariables = {};
    // Parse each line to extract key-value pairs
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVariables[key.trim()] = value.trim();
      }
    });
    return envVariables;
  } catch (error) {
    console.error("Error loading environment variables:", error.message);
    process.exit(1);
  }
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
function buildAndPushDockerImage(envVars, version) {
  const { IMAGE_NAME, DOCKERFILE_PATH } = envVars;
  const imageVersionTag = `${IMAGE_NAME}:${version}`;
  const imageLatestTag = `${IMAGE_NAME}:latest`;

  try {
    console.log("Building Docker image...");
    execSync(`docker build -f ${DOCKERFILE_PATH} --build-arg VERSION_TAG=${version} -t ${imageVersionTag} -t ${imageLatestTag} .`, { stdio: 'inherit' });

    console.log(`Pushing '${version}' and 'latest' to Docker registry...`);
    execSync(`docker push ${imageVersionTag}`, { stdio: 'inherit' });
    execSync(`docker push ${imageLatestTag}`, { stdio: 'inherit' });

    console.log(`Docker image built and tagged with both ${version} and 'latest' successfully.`);
  } catch (error) {
    console.error("Error during Docker build or push:", error.message);
    process.exit(1);
  }
}

// Run the main function
main();
