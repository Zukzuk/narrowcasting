import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import data from '../package.json' with { type: 'json' };
import dotenv from 'dotenv';
// __dirname emulation in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../deploy/public.env') });
dotenv.config({ path: path.resolve(__dirname, '../dev.env') });

// Main function to orchestrate the script execution
function main() {
  if (!data.version) {
    console.error("Error: No version found in package.json. Please specify a version.");
    process.exit(1);
  }
  const APP_VERSION_TAG = `${data.version}-dev`;
  const APP_PORT = process.env.APP_PORT;
  const COMMANDS = process.env.APP_RUN === undefined || process.env.APP_RUN === "true" || process.env.APP_RUN === "1" ? "up --build --force-recreate" : "build --no-cache";
  buildTypeScript();
  buildAndComposeDev(APP_VERSION_TAG, APP_PORT, COMMANDS);
}

// Function to transpile TypeScript to JavaScript
function buildTypeScript() {
  try {
    console.log(`npm cache clean --force && npm install --os=linux --libc=musl --cpu=x64 sharp && npm run build`);
    execSync('npm cache clean --force && npm install --os=linux --libc=musl --cpu=x64 sharp && npm run build', { stdio: 'inherit' });
    console.log("Compilation successful.");
  } catch (error) {
    console.error("Error compiling TypeScript:", error.message);
    process.exit(1);
  }
}

// Function to build the development Docker image
function buildAndComposeDev(APP_VERSION_TAG, APP_PORT, COMMANDS) {
  try {
    console.log(`docker-compose -f docker-compose.dev.yml ${COMMANDS}`);
    execSync(`docker-compose -f docker-compose.dev.yml ${COMMANDS}`, {
      stdio: 'inherit',
      env: { ...process.env, APP_VERSION_TAG, APP_PORT }
    });
    console.log("Docker compose started successfully.");
  } catch (error) {
    console.error("Error starting Docker compose:", error.message);
    process.exit(1);
  }
}

main();
