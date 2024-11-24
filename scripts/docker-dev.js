import { execSync } from 'child_process';
import data from '../package.json' assert { type: 'json' };

function main() {
  if (!data.version) {
    console.error("Error: No version found in package.json. Please specify a version.");
    process.exit(1);
  }
  const APP_VERSION_TAG = `${data.version}-dev`;
  const PROCESS = process.env.APP_RUN === undefined || process.env.APP_RUN === "true" || process.env.APP_RUN === "1" ? "up --build" : "build";
  buildTypeScript();
  buildAndComposeDev(APP_VERSION_TAG, PROCESS);
}

function buildTypeScript() {
  try {
    console.log(`npm i && npm run build`);
    execSync('npm run internalscript:install:onlydev && npm run build', { stdio: 'inherit' });
    console.log("Compilation successful.");
  } catch (error) {
    console.error("Error compiling TypeScript:", error.message);
    process.exit(1);
  }
}

function buildAndComposeDev(APP_VERSION_TAG, PROCESS) {
  try {
    console.log(`docker-compose -f docker-compose.dev.yml ${PROCESS} --force-recreate`);
    execSync(`docker-compose -f docker-compose.dev.yml ${PROCESS} --force-recreate`, {
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
