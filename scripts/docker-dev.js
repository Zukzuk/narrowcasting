import { execSync } from 'child_process';
import data from '../package.json' assert { type: 'json' };

function main() {
  if (!data.version) {
    console.error("Error: No version found in package.json. Please specify a version.");
    process.exit(1);
  }
  const APP_RUN = process.env.APP_RUN ? "up --build" : "build";
  buildTypeScript();
  buildAndComposeDev(`${data.version}-dev`, APP_RUN);
}

function buildTypeScript() {
  try {
    console.log("Copying dist and compiling TypeScript...");
    execSync('npm i --only=dev && npm run build', { stdio: 'inherit' });
    console.log("Build successful.");
  } catch (error) {
    console.error("Error compiling TypeScript:", error.message);
    process.exit(1);
  }
}

function buildAndComposeDev(APP_VERSION_TAG, APP_RUN) {
  try {
    console.log(`Starting Docker compose with APP_VERSION_TAG=${APP_VERSION_TAG}...`);
    execSync(`docker-compose -f docker-compose.dev.yml ${APP_RUN}`, {
      stdio: 'inherit',
      env: { ...process.env, APP_VERSION_TAG }
    });
    console.log("Docker compose started successfully.");
  } catch (error) {
    console.error("Error starting Docker compose:", error.message);
    process.exit(1);
  }
}

main();
