#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import data from '../package.json' with { type: 'json' };
import dotenv from 'dotenv';
// __dirname emulation in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../deploy/public.env') });

// Main function to orchestrate the script execution
function main() {
  if (!data.version) {
    console.error("Error: No version found in package.json. Please specify a version.");
    process.exit(1);
  }
  const APP_VERSION_TAG = data.version;
  const APP_PORT = process.env.APP_PORT;
  buildAndPushDockerImage(APP_VERSION_TAG, APP_PORT);
}

// Function to build and push the Docker image
function buildAndPushDockerImage(APP_VERSION_TAG, APP_PORT) {
  const imageVersionTag = `zukzuk/narrowcasting:${APP_VERSION_TAG}`;
  const imageLatestTag = `zukzuk/narrowcasting:latest`;
  try {
    console.log(`docker build -f scripts/Dockerfile.release --build-arg APP_VERSION_TAG=${APP_VERSION_TAG} --build-arg APP_PORT=${APP_PORT} -t ${imageVersionTag} -t ${imageLatestTag} .`);
    execSync(`docker build -f scripts/Dockerfile.release --build-arg APP_VERSION_TAG=${APP_VERSION_TAG} --build-arg APP_PORT=${APP_PORT} -t ${imageVersionTag} -t ${imageLatestTag} .`, { stdio: 'inherit' });
    console.log(`Pushing '${APP_VERSION_TAG}' and 'latest' to Docker registry...`);
    execSync(`docker push ${imageVersionTag}`, { stdio: 'inherit' });
    execSync(`docker push ${imageLatestTag}`, { stdio: 'inherit' });
    console.log(`Docker release image built and tagged with both ${APP_VERSION_TAG} and 'latest' successfully.`);
  } catch (error) {
    console.error("Error during Docker build or push:", error.message);
    process.exit(1);
  }
}

main();
