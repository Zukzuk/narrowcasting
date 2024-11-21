import { execSync } from 'child_process';
import data from '../package.json' assert { type: 'json' };

function main() {
  if (!data.version) {
    console.error("Error: No version found in package.json. Please specify a version.");
    process.exit(1);
  }
  buildTypeScript();
  buildAndComposeDev(data.version);
}

function buildTypeScript() {
  try {
    console.log("Copying dist and compiling TypeScript...");
    execSync('npm i --only=dev && mkdirp dist/public && cpx \"src/public/**/*\" dist/public && npm run build', { stdio: 'inherit' });
    console.log("Build successful.");
  } catch (error) {
    console.error("Error compiling TypeScript:", error.message);
    process.exit(1);
  }
}

function buildAndComposeDev(APP_VERSION_TAG) {
  try {
    console.log(`Starting Docker compose with APP_VERSION_TAG=${APP_VERSION_TAG}...`);
    execSync(`docker-compose -f docker-compose.dev.yml up --build`, {
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
